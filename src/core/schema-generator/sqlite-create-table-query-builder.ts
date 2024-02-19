import { ColumnOpts, PrimaryKeyOpts } from "../decorators";
import { PRIMARY_KEY_METADATA_KEY } from "../metadata/constants";
import { MetadataExtractor } from "../metadata/metadata-extractor";
import "reflect-metadata";
import { OrmTypesToSQLiteMap, SQLiteType } from "../type-maps/sqlite-types"; // Questo dovrebbe essere adattato per SQLite
import { CreateTableQueryBuilder } from "./create-table-query-builder";

export class SQLiteCreateTableQueryBuilder implements CreateTableQueryBuilder {
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
    ): ColumnOpts => {
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
        const columnNotNull = !propertyMetadata?.nullable;
        let columnType = OrmTypesToSQLiteMap[
          propertyMetadata.type
        ] as SQLiteType;

        let columnDefinition = `${columnName} ${columnType} ${columnNotNull ? `NOT NULL` : ``
          }`;

        if (primaryKeyMetadata) {
          columnDefinition += " PRIMARY KEY";
          if (primaryKeyMetadata.autoIncrement) {
            columnDefinition += " AUTOINCREMENT";
          }
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