import { COLUMN_METADATA_KEY } from "./core/metadata/constants";
import { LilORMType } from "./core/type-maps/lil-orm-types";

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
        const columnName = columnMetadata.name || propertyKey.toString()
        entity[propertyKey] = EntityTransformer.formatValue(
          values[columnName],
          columnMetadata.type
        );
      }
    }

    return entity as TEntity;
  }

  static formatValue(value: any, type: LilORMType): any {
    if (value == null) {
      return null;
    }

    switch (type) {
      case "integer":
      case "decimal":
      case "float":
      case "double":
        return Number(value);
      case "money":
        if (typeof value === "number") {
          return value;
        }
        return parseFloat((value as string).replace(/[^0-9.-]+/g, ""));
      case "boolean":
        return (
          value === "true" ||
          value === "t" ||
          value === 1 ||
          value === "1" ||
          value === true
        );
      case "json":
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      case "date":
      case "timestamp":
        return new Date(value);
      case "blob":
      case "binary":
        return Buffer.from(value);
      default:
        return value;
    }
  }
}
