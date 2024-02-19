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
        const columnName = columnMetadata.name || propertyKey.toString();
        entity[propertyKey] = EntityTransformer.formatValue(
          values[columnName],
          columnMetadata.type
        );
      }
    }

    return entity as TEntity;
  }

  static formatValue(value: any, type: LilORMType): any {
    switch (type) {
      case "integer":
      case "decimal":
      case "float":
      case "double":
      case "money":
        return Number(value);
      case "boolean":
        return value === "true" || value === 1;
      case "json":
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
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
