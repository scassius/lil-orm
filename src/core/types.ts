export type DBSMType = 'postgresql' | 'sqlite';

export interface LilORMModuleOptions {
  database: string;
  entities: any[];
}

export interface ColumnMetadata {
  name: string;
  type: LilORMType;
  value: string | number;
}

export type SQLiteType =
  | "INTEGER"
  | "REAL"
  | "TEXT"
  | "BLOB"
  | "NUMERIC"
  | "BOOLEAN"
  | "DATE"
  | "TIMESTAMP";

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
  | "money"
  | "numrange"
  | "inet"
  | "cidr"
  | "xml"
  | "geometry"
  | "geography";

export type LilORMType =
  | "integer"
  | "text"
  | "real"
  | "blob"
  | "json"
  | "boolean"
  | "date"
  | "uuid"
  | "timestamp"
  | "decimal"
  | "float"
  | "double"
  | "time"
  | "char"
  | "varchar"
  | "enum"
  | "array"
  | "binary"
  | "bit"
  | "money"
  | "range"
  | "inet"
  | "cidr"
  | "jsonb"
  | "xml"
  | "geometry"
  | "geography";

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
  range: "numrange",
  inet: "inet",
  cidr: "cidr",
  jsonb: "jsonb",
  xml: "xml",
  geometry: "geometry",
  geography: "geography"
};

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
  money: "NUMERIC",
  range: "TEXT",
  inet: "TEXT",
  cidr: "TEXT",
  jsonb: "TEXT",
  xml: "TEXT",
  geometry: "TEXT",
  geography: "TEXT"
};

export type EntityType<T> = new () => T extends object ? T : any;
