import { COLUMN_METADATA_KEY } from "./metadata/constants";
import { MetadataExtractor } from "./metadata/metadata-extractor";
import {
  ColumnMetadata,
  LilORMType,
  OrmTypesToSQLiteMap,
  SQLiteType,
} from "./types";
import { TypesHelper } from "./types-helper";

export class EntityTransformer {
  static sqlEntityToObj<TEntity>(
    entityInstance: any,
    values: any
  ): TEntity {
    const properties = Object.keys(entityInstance);
    const entity: any = {};

    for (const propertyKey of properties) {
      const columnMetadata = Reflect.getMetadata(
        COLUMN_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (columnMetadata) {
        const columnName = columnMetadata.name || propertyKey.toString();
        entity[propertyKey] = EntityTransformer.formatValue(
          values[columnName],
          columnMetadata.type
        );
      }
    }

    return entity as TEntity;
  }

  static valueQueryFormatter(value: any): string {
    if (value === null) return `NULL`;
    if (TypesHelper.isString(value)) return `'${value}'`;
    if (TypesHelper.isDate(value)) return `'${(value as Date).toISOString()}'`;
    if (TypesHelper.isBoolean(value)) return value ? "1" : "0";
    if (TypesHelper.isNumber(value)) return value.toString();
    if (TypesHelper.isJSONObject(value)) return `'${JSON.stringify(value)}'`;
    throw new Error("Not supported type");
  }

  static get typeFormatters() {
    return {
      TEXT: (value: any) =>
        typeof value === "string" ? `'${value}'` : String(value),
      INTEGER: (value: any) =>
        typeof value === "boolean" ? (value ? 1 : 0) : parseInt(value, 10),
      REAL: (value: any) => parseFloat(value),
      JSON: (value: any) => `'${JSON.stringify(value)}'`,
      BOOLEAN: (value: any) => (value === true ? 1 : 0),
      DATE: (value: any) => `${new Date(value).getTime()}`,
      BLOB: (value: any) => `'${value}'`,
      UUID: (value: any) => `'${value}'`,
    };
  }

  static get invTypeFormatters() {
    return {
      TEXT: (value: any) =>
        typeof value === "string" ? `${value}` : String(value),
      INTEGER: (value: any) =>
        typeof value === "boolean" ? (value ? 1 : 0) : parseInt(value, 10),
      REAL: (value: any) => parseFloat(value),
      JSON: (value: any) => JSON.parse(value),
      BOOLEAN: (value: any) => Boolean(value),
      DATE: (value: any) => new Date(parseInt(value, 10)),
      BLOB: (value: any) => value,
      UUID: (value: any) => value,
    };
  }

  static formatValue(value: any, type: LilORMType): any {
    if (value === undefined || Number.isNaN(value)) return undefined;
    if (value === null) return null;
    const formatter = EntityTransformer.invTypeFormatters[type];
    if (formatter) {
      return formatter(value);
    }
    return value;
  }

  static formatValueToSQLiteType(value: any, type: LilORMType): any {
    if (value === undefined) return undefined;
    if (value === null) return "NULL";

    const formatter = EntityTransformer.typeFormatters[type];
    if (formatter) {
      return formatter(value);
    }
    return value;
  }
}
