import { LilORMType } from "./lil-orm-types";

export type PostgreSQLType =
  | "integer"
  | "text"
  | "text[]"
  | "real"
  | "bytea"
  | "jsonb"
  | "boolean"
  | "timestamp"
  | "uuid"
  | "numeric"
  | "double precision"
  | "time"
  | "char"
  | "varchar"
  | "bit"
  | "money";

export const OrmTypesToPostgreSQLMap: Record<LilORMType, PostgreSQLType> = {
  integer: "integer",
  text: "text",
  real: "real",
  blob: "bytea",
  json: "jsonb",
  boolean: "boolean",
  date: "timestamp",
  uuid: "uuid",
  timestamp: "timestamp",
  decimal: "numeric",
  float: "real",
  double: "double precision",
  time: "time",
  char: "char",
  varchar: "varchar",
  enum: "text",
  array: "text[]",
  binary: "bytea",
  bit: "bit",
  money: "money",
};
