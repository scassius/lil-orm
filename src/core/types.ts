export interface LilORMModuleOptions {
  database: string;
  entities: any[];
}

export interface ColumnMetadata {
  name: string;
  type: LilORMType;
  value: string | number;
}

export type SQLiteType = "INTEGER" | "TEXT" | "REAL" | "BLOB";
export type LilOrmTypeExtension = "JSON" | "BOOLEAN" | "DATE" | "UUID";

export type LilORMType = SQLiteType | LilOrmTypeExtension;

export const OrmTypesToSQLiteMap = {
  INTEGER: "INTEGER",
  TEXT: "TEXT",
  REAL: "REAL",
  BLOB: "BLOB",
  JSON: "TEXT",
  BOOLEAN: "INTEGER",
  DATE: "INTEGER",
  UUID: "TEXT",
};
/*
export const TSTypesToOrmTypesMap = {
  "string": 'TEXT'
  "number": 'REAL',
  "bigint": 'INTEGER'
  "boolean": 'BOOLEAN',
  "object" | "function"
  any: 'JSON',
  number: 'REAL',
  boolean: 'INTEGER',
  Date: 'TEXT',
  string: 'TEXT',
  bigint: 'INTEGER',
  Buffer: "BLOB",
  Array: 'JSON'
}*/

export type EntityType<T> = new () => T extends object ? T : any;
