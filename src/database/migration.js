"use strict";

const ENVIRONMENT = require("process").argv[2];
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(".sqlite3");

console.log(process.cwd());

// Tables are Defined here.
const tables = [
  {
    name: "pins",
    data: {
      key: "",
      type: "",
      primary_key: true,
    },
  },
  {
    name: "users",
    data: [
      {
        key: "",
        type: "",
        primary_key: false,
      },
    ],
  },
];

for (let table of tables) {
  db.exec(``);
}
