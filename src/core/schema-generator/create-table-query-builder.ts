import { ColumnOtps, PrimaryKeyOpts } from "../decorators";
import { PRIMARY_KEY_METADATA_KEY } from "../metadata/constants";
import { MetadataExtractor } from "../metadata/metadata-extractor";
import { OrmTypesToSQLiteMap, SQLiteType } from "../types";
import "reflect-metadata";

export class CreateTableQueryBuilder {
  createTableSql(entityClass: any): string {
    const entityMetadata = MetadataExtractor.getEntityTableName(entityClass);
    if (!entityMetadata) {
      throw new Error("Entity metadata not found");
    }
    const tableName = entityMetadata || entityClass.constructor.name;

    const entityInstance = new entityClass();
    const columns: string[] = [];

    const getColumnMetadata = (
      target: any,
      propertyKey: string | symbol
    ): ColumnOtps => {
      return MetadataExtractor.getColumnMetadata(target, propertyKey);
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
        const columnNotNull = propertyMetadata?.notNull || false;
        const columnType = OrmTypesToSQLiteMap[
          propertyMetadata.type
        ] as SQLiteType;
        const primaryKeyOptions = primaryKeyMetadata || {};

        let columnDefinition = `${columnName} ${columnType} ${
          columnNotNull ? `NOT NULL` : ``
        }`;

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
}
