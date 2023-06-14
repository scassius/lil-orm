import { MetadataExtractor } from "./metadata";
import { ColumnMetadata, LilORMType, MapTypes, SQLiteType } from "./types";
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
        "column",
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
        column.type = MapTypes[column.type] as SQLiteType;
        return column;
      });
    return columns;
  }

  static valueQueryFormatter(value: any): string {
    if (value === null) return `NULL`;
    if (TypesHelper.isString(value)) return `'${value}'`;
    if (TypesHelper.isDate(value)) return `'${value.toISOString()}'`;
    if (TypesHelper.isBoolean(value)) return value ? "1" : "0";
    if (TypesHelper.isNumber(value)) return value.toString();
    if (TypesHelper.isJSONObject(value)) return `'${JSON.stringify(value)}'`;
    throw new Error("Not supported type");
  }

  static formatValue(value: any, type: LilORMType): any {
    if (type === "TEXT" || type === "UUID" || type === "BLOB") {
      if (TypesHelper.isDate(value)) return value.toISOString();
      if (TypesHelper.isJSONObject(value)) return JSON.stringify(value);

      return TypesHelper.parseString(value);
    }
    if (type === "INTEGER") {
      if (TypesHelper.isBoolean(value)) return value ? 1 : 0;

      return TypesHelper.parseInteger(value);
    }
    if (type === "REAL") {
      return TypesHelper.parseReal(value);
    }
    if (type === "JSON") {
      return TypesHelper.parseJson(value);
    }
    if (type === "BOOLEAN") {
      return TypesHelper.parseBoolean(value);
    }
    if (type === "DATE") {
      return TypesHelper.parseDate(value);
    }

    return value;
  }

  static formatValueToSQLiteType(value: any, type: LilORMType): any {
    const mappedType = MapTypes[type] as SQLiteType;

    return this.formatValue(value, mappedType);
  }
}
