import {
  COLUMN_METADATA_KEY,
  ENTITY_METADATA_KEY,
  ON_INSERT_METADATA_KEY,
  ON_UPDATE_METADATA_KEY,
  PRIMARY_KEY_METADATA_KEY,
} from "./constants";
import { ColumnOpts } from "../decorators";
import { ColumnMetadata, LilORMType } from "../type-maps/lil-orm-types";
import { TypesHelper } from "../type-maps/types-helper";
import { EntityTransformer } from "../../entity-transformer";

export class MetadataExtractor {
  /**
   * Retrieves the table name associated with an entity class.
   * @param {Object} entityClass - The entity class.
   * @returns {string} The table name.
   * @throws {Error} If the entity metadata or table name is not found.
   */
  static getEntityTableName(entityClass: any): string {
    const entityMetadata = Reflect.getMetadata(
      ENTITY_METADATA_KEY,
      entityClass
    );
    const tableName = entityMetadata.name;
    return tableName;
  }

  /**
   * Retrieves the primary key property and column name from an entity instance.
   * @param {Object} entityInstance - The entity instance.
   * @returns {Object} An object containing the property key and column name of the primary key.
   * @throws {Error} If the primary key metadata is not found.
   */
  static getEntityPrimaryKey(entityInstance: any): {
    propertyKey: string;
    columnName: string;
  } {
    const properties = Object.keys(entityInstance);

    for (const propertyKey of properties) {
      const primaryKeyMetadata = Reflect.getMetadata(
        PRIMARY_KEY_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (primaryKeyMetadata) {
        const columnName = primaryKeyMetadata.name || propertyKey.toString();
        return { propertyKey, columnName };
      }
    }

    throw new Error("Primary key not found");
  }

  /**
   * Retrieves the column names associated with an entity instance.
   * @param {any} entityInstance - The entity instance.
   * @returns {string[]} An array of column names.
   */
  static getEntityColumnsName(entityInstance: any): string[] {
    const columns: string[] = [];
    const properties = Object.keys(entityInstance);

    for (const propertyKey of properties) {
      const columnMetadata = Reflect.getMetadata(
        COLUMN_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (columnMetadata) {
        const columnName = columnMetadata.name || propertyKey.toString();
        columns.push(columnName);
      }
    }

    return columns;
  }

  static getEnrichedEntityColumnsMetadata(
    entityInstance: any
  ): ColumnMetadata[] {
    const columns: ColumnMetadata[] = [];
    const properties = Object.keys(entityInstance);

    for (const propertyKey of properties) {
      const columnMetadata = Reflect.getMetadata(
        COLUMN_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (columnMetadata) {
        const columnName = columnMetadata.name || propertyKey.toString();
        columns.push({
          name: columnName,
          type: columnMetadata?.type as LilORMType,
          value: entityInstance[propertyKey],
        });
      }
    }

    return columns;
  }

  /**
   * Retrieves the formatted column values associated with an entity instance.
   * @param {any} entityInstance - The entity instance.
   * @returns {string[]} An array of formatted column values.
   */
  static getEntityValues(entityInstance: any): any[] {
    const values: any[] = [];
    const properties = Object.keys(entityInstance);

    for (const propertyKey of properties) {
      const columnMetadata = Reflect.getMetadata(
        COLUMN_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (columnMetadata) {
        const propertyValue = entityInstance[propertyKey];
        values.push(propertyValue);
      }
    }

    return values;
  }

  static getColumnMetadata(
    target: any,
    propertyKey: string | symbol
  ): ColumnOpts {
    return Reflect.getMetadata(COLUMN_METADATA_KEY, target, propertyKey);
  }

  static processInsert(entity: any) {
    const constructor = entity.constructor;
    if (Reflect.hasMetadata(ON_INSERT_METADATA_KEY, constructor)) {
      const onInsertMetadata: Map<string | symbol, () => any> =
        Reflect.getMetadata(ON_INSERT_METADATA_KEY, constructor);
      for (const [propertyKey, generateFunction] of onInsertMetadata) {
        entity[propertyKey] = generateFunction();
      }
    }
  }

  static processUpdate(entity: any) {
    const constructor = entity.constructor;
    if (Reflect.hasMetadata(ON_UPDATE_METADATA_KEY, constructor)) {
      const onUpdateMetadata: Map<string | symbol, () => any> =
        Reflect.getMetadata(ON_UPDATE_METADATA_KEY, constructor);
      for (const [propertyKey, generateFunction] of onUpdateMetadata) {
        entity[propertyKey] = generateFunction();
      }
    }
  }
}
