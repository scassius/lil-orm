import { COLUMN_METADATA_KEY } from "./metadata/constants";
import { MetadataExtractor } from "./metadata/metadata-extractor";
import {
  escapeJSONForSQL,
  escapeValue,
} from "./query-builders/proprety-mapping";
import {
  ColumnMetadata,
  LilORMType,
  OrmTypesToPostgreSQLMap,
  PostgreSQLType,
} from "./types";
import { TypesHelper } from "./types-helper";
import { formatISO, parseISO } from "date-fns";

export class EntityTransformer {
  static sqlEntityToObj<TEntity>(entityInstance: any, values: any): TEntity {
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
    if (TypesHelper.isString(value)) return `${value}`;
    if (TypesHelper.isDate(value)) return `'${(value as Date).toUTCString()}'`;
    if (TypesHelper.isBoolean(value)) return value ? "true" : "false";
    if (TypesHelper.isNumber(value)) return value.toString();
    if (TypesHelper.isJSONObject(value)) return `'${JSON.stringify(value)}'`;
    throw new Error("Not supported type");
  }

  static get typeFormatters() {
    return {
      TEXT: (value: any) => `${escapeValue(value)}`,
      INTEGER: (value: any) => parseInt(value, 10).toString(),
      REAL: (value: any) => parseFloat(value).toString(),
      JSON: (value: any) => `${escapeJSONForSQL(value)}`,
      BOOLEAN: (value: any) => (value ? "true" : "false"),
      DATE: (value: any) => `'${formatISO(new Date(value))}'`,
      UUID: (value: any) => `'${value}'`,
      BLOB: (value: any) => `'\\x${value.toString("hex")}'`,
    };
  }

  static get invTypeFormatters() {
    return {
      TEXT: (value: any) => value,
      INTEGER: (value: any) => parseInt(value, 10),
      REAL: (value: any) => parseFloat(value),
      JSON: (value: any) => value,
      BOOLEAN: (value: any) => Boolean(value === true),
      DATE: (value: any) => new Date(value),
      UUID: (value: any) => value,
      BLOB: (value: any) => Buffer.from(value.slice(2), "hex"),
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

  static formatValueToPostgreSQLType(value: any, type: LilORMType): any {
    if (value === undefined) return undefined;
    if (value === null) return "NULL";

    const formatter = EntityTransformer.typeFormatters[type];
    if (formatter) {
      return formatter(value);
    }
    return value;
  }
}
