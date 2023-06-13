import { COLUMN_METADATA_KEY, PRIMARY_KEY_METADATA_KEY } from "./constants";
import { PrimaryKeyOpts, ColumnOtps } from "./decorators";
import { EntityTransformer } from "./entity-transformer";
import { escapeValue } from "./helper";
import { MetadataExtractor } from "./metadata";
import { EntityType, MapTypes, SQLiteType } from "./types";
import "reflect-metadata";

export class QueryBuilder {
  static createTableSql(entityClass: any): string {
    const entityMetadata = Reflect.getMetadata("entity", entityClass);
    if (!entityMetadata) {
      throw new Error("Entity metadata not found");
    }
    const tableName = entityMetadata.name || entityClass.constructor.name;

    const entityInstance = new entityClass();
    const columns: string[] = [];

    const getColumnMetadata = (
      target: any,
      propertyKey: string | symbol
    ): ColumnOtps => {
      return Reflect.getMetadata(COLUMN_METADATA_KEY, target, propertyKey);
    };

    const getPrimaryKeyMetadata = (
      target: any,
      propertyKey: string | symbol
    ): PrimaryKeyOpts => {
      return Reflect.getMetadata(PRIMARY_KEY_METADATA_KEY, target, propertyKey);
    };

    const properties = Object.getOwnPropertyNames(entityInstance);

    properties.forEach((propertyKey) => {
      const propertyMetadata = getColumnMetadata(entityInstance, propertyKey);
      const primaryKeyMetadata = getPrimaryKeyMetadata(
        entityInstance,
        propertyKey
      );

      if (propertyMetadata) {
        const columnName = propertyMetadata.name || propertyKey.toString();
        const columnType = MapTypes[propertyMetadata.type] as SQLiteType;
        const primaryKeyOptions = primaryKeyMetadata || {};

        let columnDefinition = `${columnName} ${columnType}`;

        if (primaryKeyOptions.autoIncrement) {
          columnDefinition += " PRIMARY KEY AUTOINCREMENT";
        }

        columns.push(columnDefinition);
      }
    });

    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(
      ", "
    )});`;

    return createTableQuery;
  }

  static insertSql<TEntity>(
    entityObject: any,
    entityClass: EntityType<TEntity>
  ): string {
    const entityInstance = Object.assign(new entityClass(), entityObject);
    const tableName = MetadataExtractor.getEntityTableName(entityClass);
    const columns =
      EntityTransformer.transformClassInstanceToEntityColumns(entityInstance);

    const columnsNames = columns.map((column) => column.name);
    const values = columns.map((column) =>
      EntityTransformer.valueQueryFormatter(column.value)
    );

    const insertQuery = `INSERT INTO ${tableName} (${columnsNames.join(
      ", "
    )}) VALUES (${values.join(", ")});`;
    return insertQuery;
  }

  static updateSql<TEntity>(
    entityObject: any,
    entityClass: EntityType<TEntity>
  ): string {
    const entityInstance = Object.assign(new entityClass(), entityObject);
    const tableName = MetadataExtractor.getEntityTableName(entityClass);
    const columns =
      EntityTransformer.transformClassInstanceToEntityColumns(entityInstance);

    const setClause = columns
      .filter((col) => col.value !== undefined)
      .map((col) => {
        if (!(col.value === undefined)) {
          return `${col.name} = ${escapeValue(col.value)}`;
        }
      })
      .join(", ");

    const primaryKey = MetadataExtractor.getEntityPrimaryKey(new entityClass());
    const id = (entityInstance as any)[primaryKey.propertyKey];

    const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${primaryKey.columnName} = ${id};`;

    return updateQuery;
  }

  static deleteSql(entity: any): string {
    const tableName = MetadataExtractor.getEntityTableName(entity);
    const primaryKey = MetadataExtractor.getEntityPrimaryKey(entity);
    const values = MetadataExtractor.getEntityValues(entity);

    const deleteQuery = `DELETE FROM ${tableName} WHERE ${primaryKey} = ${values[0]};`;

    return deleteQuery;
  }
}
