import { Sequelize } from "sequelize";

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export default function connectDatabase(development) {
  const prefix = development ? "DEV_DB_" : "DB_";
  const sslEnabled =
    !development && process.env.DB_SSL?.toLowerCase() === "true";

  return new Sequelize({
    dialect: "postgres",
    host: process.env[`${prefix}HOST`],
    port: numberFromEnv(`${prefix}PORT`, 5432),
    database: process.env[`${prefix}NAME`],
    username: process.env[`${prefix}USER`],
    password: process.env[`${prefix}PASSWORD`],
    logging: process.env.DEBUG?.toLowerCase() === "true" ? console.log : false,
    pool: {
      max: numberFromEnv("DB_POOL_MAX", 5),
      min: numberFromEnv("DB_POOL_MIN", 0),
      acquire: numberFromEnv("DB_POOL_ACQUIRE_MS", 30000),
      idle: numberFromEnv("DB_POOL_IDLE_MS", 10000),
    },
    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED?.toLowerCase() !== "false",
          },
        }
      : {},
  });
}
