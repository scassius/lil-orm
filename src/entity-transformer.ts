import { COLUMN_METADATA_KEY } from "./core/metadata/constants";
import { LilORMType } from "./core/types";

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
        entity[propertyKey] = values[columnName];
      }
    }

    return entity as TEntity;
  }

  static formatValues() {

  }
}
