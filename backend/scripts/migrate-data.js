const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Sequelize, QueryTypes } = require("sequelize");
const { default: connectDatabase } = require("../services/connection.js");
const baseline = require("../migrations/001_baseline.js");

const TABLES = {
  Users: ["id", "authLevel", "username", "email", "password", "createdAt", "updateTimestamp"],
  Pins: ["id", "image", "authorid", "title", "comment", "lat", "lng", "parent", "createdAt", "updateTimestamp"],
  Comments: ["id", "replyLevel", "authorid", "comment", "PinParent", "CommentParent", "createdAt", "updateTimestamp"],
};

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function canonical(value, column) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return value.toISOString();
  if ((column === "createdAt" || column === "updateTimestamp") && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  if (typeof value === "number") return String(value);
  return String(value);
}

function checksum(rows, columns) {
  const hash = crypto.createHash("sha256");
  for (const row of rows) {
    hash.update(columns.map((column) => canonical(row[column], column)).join("\u001f"));
    hash.update("\n");
  }
  return hash.digest("hex");
}

function sourcePath() {
  return path.resolve(
    __dirname,
    "..",
    argument("source") || process.env.MIGRATION_SOURCE_PATH || "../.sqlite3",
  );
}

function storagePath() {
  return path.resolve(__dirname, "../..", process.env.STORAGE_PATH || "public/storage/");
}

async function readSource(file) {
  if (!fs.existsSync(file)) throw new Error(`SQLite source does not exist: ${file}`);

  const source = new Sequelize({
    dialect: "sqlite",
    storage: file,
    logging: false,
  });

  await source.authenticate();
  const tables = await source.query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    { type: QueryTypes.SELECT },
  );
  const names = new Set(tables.map(({ name }) => name));
  for (const name of [...Object.keys(TABLES), "Sessions"]) {
    if (!names.has(name)) throw new Error(`SQLite source is missing table ${name}`);
  }

  for (const [table, columns] of Object.entries(TABLES)) {
    const definition = await source.query(`PRAGMA table_info(\`${table}\`)`, {
      type: QueryTypes.SELECT,
    });
    const actual = new Set(definition.map(({ name }) => name));
    for (const column of columns) {
      if (!actual.has(column)) throw new Error(`SQLite source is missing ${table}.${column}`);
    }
  }

  const data = {};
  for (const [table, columns] of Object.entries(TABLES)) {
    data[table] = await source.query(
      `SELECT ${columns.map((column) => `\`${column}\``).join(", ")} FROM \`${table}\` ORDER BY id ASC`,
      { type: QueryTypes.SELECT },
    );
  }

  const integrity = await source.query("PRAGMA foreign_key_check", {
    type: QueryTypes.SELECT,
  });
  await source.close();
  if (integrity.length) throw new Error("SQLite foreign-key integrity check failed");
  return data;
}

function validateRows(data) {
  const users = new Set(data.Users.map((row) => row.id));
  const pins = new Set(data.Pins.map((row) => row.id));
  const comments = new Set(data.Comments.map((row) => row.id));

  for (const row of data.Pins) {
    if (row.authorid !== null && !users.has(row.authorid)) {
      throw new Error(`Pin ${row.id} references missing user ${row.authorid}`);
    }
    if (row.image && path.isAbsolute(row.image)) {
      throw new Error(`Pin ${row.id} contains an absolute image path`);
    }
    if (row.image && row.image.split(/[\\/]/).includes("..")) {
      throw new Error(`Pin ${row.id} contains an unsafe image path`);
    }
  }
  for (const row of data.Comments) {
    if (row.authorid !== null && !users.has(row.authorid)) {
      throw new Error(`Comment ${row.id} references missing user ${row.authorid}`);
    }
    if (!pins.has(row.PinParent)) {
      throw new Error(`Comment ${row.id} references missing pin ${row.PinParent}`);
    }
    if (row.CommentParent !== null && !comments.has(row.CommentParent)) {
      throw new Error(`Comment ${row.id} references missing parent ${row.CommentParent}`);
    }
  }
}

function validateFiles(data) {
  const root = storagePath();
  for (const row of data.Pins) {
    if (!row.image) continue;
    const file = path.resolve(root, row.image);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file)) {
      throw new Error(`Missing storage file for pin ${row.id}: ${row.image}`);
    }
  }
}

async function resetTarget(database) {
  const queryInterface = database.getQueryInterface();
  await queryInterface.dropTable("Comments", { cascade: true }).catch(() => {});
  await queryInterface.dropTable("Pins", { cascade: true }).catch(() => {});
  await queryInterface.dropTable("Users", { cascade: true }).catch(() => {});
  await queryInterface.dropTable("Sessions", { cascade: true }).catch(() => {});
  await baseline.up(queryInterface);
}

async function importRows(database, data) {
  const transaction = await database.transaction();
  try {
    for (const [table, rows] of Object.entries(data)) {
      for (const row of rows) {
        await database.getQueryInterface().bulkInsert(table, [row], { transaction });
      }
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function targetRows(database, table) {
  return database.query(
    `SELECT ${TABLES[table].map((column) => `"${column}"`).join(", ")} FROM "${table}" ORDER BY "id" ASC`,
    { type: QueryTypes.SELECT },
  );
}

async function validateTarget(database, source) {
  for (const [table, columns] of Object.entries(TABLES)) {
    const rows = await targetRows(database, table);
    if (rows.length !== source[table].length) {
      throw new Error(`${table} row count mismatch`);
    }
    const sourceHash = checksum(source[table], columns);
    const targetHash = checksum(rows, columns);
    if (sourceHash !== targetHash) throw new Error(`${table} checksum mismatch`);
  }

  for (const table of Object.keys(TABLES)) {
    const [sequence] = await database.query(
      `SELECT pg_get_serial_sequence('"${table}"', 'id') AS sequence`,
      { type: QueryTypes.SELECT },
    );
    const max = await database.query(`SELECT COALESCE(MAX("id"), 0) AS max FROM "${table}"`, {
      type: QueryTypes.SELECT,
    });
    await database.query("SELECT setval($1::regclass, $2, true)", {
      bind: [sequence.sequence, Number(max[0].max)],
      type: QueryTypes.SELECT,
    });
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sourceFile = sourcePath();
  const source = await readSource(sourceFile);
  validateRows(source);
  validateFiles(source);

  console.log(`Source: ${sourceFile}`);
  for (const [table, rows] of Object.entries(source)) {
    console.log(`${table}: ${rows.length} rows (${checksum(rows, TABLES[table])})`);
  }
  if (!apply) {
    console.log("Dry run only. Re-run with --apply to replace the disposable target.");
    return;
  }

  if (!process.env.DATABASE_URL && !process.env.DEV_DB_NAME && !process.env.DB_NAME) {
    throw new Error("Target database configuration is missing");
  }
  const target = connectDatabase(process.env.DEVELOPMENT?.toLowerCase() === "true", {
    logging: false,
    pool: { max: 1, min: 0 },
  });
  try {
    await target.authenticate();
    await target.query("SELECT pg_advisory_lock(hashtext('crater-spotter-data-migration'))");
    await resetTarget(target);
    await importRows(target, source);
    await validateTarget(target, source);
    console.log("Migration applied and validated successfully.");
  } finally {
    await target
      .query("SELECT pg_advisory_unlock(hashtext('crater-spotter-data-migration'))")
      .catch(() => {});
    await target.close();
  }
}

require("dotenv").config({
  path: process.env.MIGRATION_ENV_FILE || path.resolve(__dirname, "../.env"),
  override: false,
});
main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
