export interface LilORMModuleOptions {
  database: string;
  entities: any[];
}

export interface ColumnMetadata {
  name: string;
  type: LilORMType;
  value: string | number;
}

export type PostgreSQLType =
  | "INTEGER"
  | "TEXT"
  | "REAL"
  | "BYTEA"
  | "JSONB"
  | "BOOLEAN"
  | "TIMESTAMP"
  | "UUID";
export type SQLiteType = "INTEGER" | "TEXT" | "REAL" | "BLOB";
export type LilOrmTypeExtension = "JSON" | "BOOLEAN" | "DATE" | "UUID";

export type LilORMType = SQLiteType | LilOrmTypeExtension;

export const OrmTypesToPostgreSQLMap: Record<LilORMType, PostgreSQLType> = {
  INTEGER: "INTEGER",
  TEXT: "TEXT",
  REAL: "REAL",
  BLOB: "BYTEA", // PostgreSQL usa BYTEA per i blob/binari
  JSON: "JSONB",
  BOOLEAN: "BOOLEAN",
  DATE: "TIMESTAMP",
  UUID: "UUID",
};

export type EntityType<T> = new () => T extends object ? T : any;
