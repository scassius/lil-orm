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

export const MapTypes = {
  INTEGER: "INTEGER",
  TEXT: "TEXT",
  REAL: "REAL",
  BLOB: "BLOB",
  JSON: "TEXT",
  BOOLEAN: "INTEGER",
  DATE: "TEXT",
  UUID: "TEXT",
};

export type EntityType<T> = new () => T extends object ? T : any;
