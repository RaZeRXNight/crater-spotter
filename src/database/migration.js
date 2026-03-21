"use strict";

const ENVIRONMENT = require("process").argv[2];
require("dotenv").config({
  path: ENVIRONMENT,
  override: true,
  debug: ENVIRONMENT ? true : false,
});
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(process.env.DATABASE);

// Tables are Defined here.
const tables = [
  {
    name: "pins",
    data: [
      {
        name: "id",
        type: "INTEGER",
        primary_key: true,
      },
      {
        name: "title",
        type: "TEXT",
      },
      {
        name: "comment",
        type: "TEXT",
      },
      {
        name: "lat",
        type: "REAL",
      },
      {
        name: "lng",
        type: "REAL",
      },
      {
        name: "parent",
        type: "INTEGER",
      },
    ],
  },
  {
    name: "users",
    data: [
      {
        name: "id",
        type: "INTEGER",
        primary_key: true,
      },
      {
        name: "value",
        type: "TEXT",
        primary_key: false,
      },
    ],
  },
];

// Iterates through each table above, and creates it within the database.
for (let table of tables) {
  let name = table["name"];
  let data = table["data"]
    .map((field) => {
      let primary_key = field.primary_key ? "PRIMARY KEY" : "";
      let name = field["name"];
      let type = field["type"];
      return `${name} ${type} ${primary_key}`;
    })
    .join(", \n");

  try {
    db.exec(`CREATE TABLE ${name}(\n${data}\n) STRICT`);
  } catch (error) {
    console.error(error.message);
  }
}
