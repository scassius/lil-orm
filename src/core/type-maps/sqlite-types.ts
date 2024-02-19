import { LilORMType } from "./lil-orm-types";

export type SQLiteType =
  | "INTEGER"
  | "REAL"
  | "TEXT"
  | "BLOB"
  | "NUMERIC"
  | "BOOLEAN"
  | "DATE"
  | "TIMESTAMP";


export const OrmTypesToSQLiteMap: Record<LilORMType, SQLiteType> = {
  integer: "INTEGER",
  text: "TEXT",
  real: "REAL",
  blob: "BLOB",
  json: "TEXT",
  boolean: "NUMERIC",
  date: "TEXT",
  uuid: "TEXT",
  timestamp: "TEXT",
  decimal: "NUMERIC",
  float: "REAL",
  double: "REAL",
  time: "TEXT",
  char: "TEXT",
  varchar: "TEXT",
  enum: "TEXT",
  array: "TEXT",
  binary: "BLOB",
  bit: "INTEGER",
  money: "NUMERIC"
};

