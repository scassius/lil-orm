import { COLUMN_METADATA_KEY } from "./metadata/constants";
import { MetadataExtractor } from "./metadata/metadata-extractor";
import { ColumnMetadata, LilORMType, OrmTypesToSQLiteMap, SQLiteType } from "./types";
import { TypesHelper } from "./types-helper";

export class EntityTransformer {
  static transformSQLEntityToObject<TEntity>(
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

  static transformClassInstanceToEntityColumns(
    entityInstance: any
  ): ColumnMetadata[] {
    const columns =
      MetadataExtractor.getEnrichedEntityColumnsMetadata(entityInstance);
    columns
      .filter((col) => col.value !== undefined)
      .map((column) => {
        column.value = this.formatValueToSQLiteType(
          column.value,
          column.type
        ) as SQLiteType;
        column.type = OrmTypesToSQLiteMap[column.type] as SQLiteType;
        return column;
      });
    return columns;
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
      TEXT: (value: any) => (typeof value === 'string' ? `'${value}'` : String(value)),
      INTEGER: (value: any) => (typeof value === 'boolean' ? value ? 1 : 0 : parseInt(value, 10)),
      REAL: (value: any) => parseFloat(value),
      JSON: (value: any) => JSON.parse(value),
      BOOLEAN: (value: any) => Boolean(value),
      DATE: (value: any) => new Date(value),
      BLOB: (value: any) => value,
      UUID: (value: any) => value
    };
  }

  static formatValue(value: any, type: LilORMType): any {
    const formatter = EntityTransformer.typeFormatters[type];
    if (formatter) {
      return formatter(value);
    }
    return value;
  }

  static formatValueToSQLiteType(value: any, type: LilORMType): any {
    if(value === undefined) return undefined;
    const mappedType = OrmTypesToSQLiteMap[type] as SQLiteType;

    return this.formatValue(value, mappedType);
  }
}
