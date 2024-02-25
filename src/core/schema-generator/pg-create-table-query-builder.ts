import { ColumnOpts, PrimaryKeyOpts } from "../decorators";
import { PRIMARY_KEY_METADATA_KEY } from "../metadata/constants";
import { MetadataExtractor } from "../metadata/metadata-extractor";
import "reflect-metadata";
import {
  OrmTypesToPostgreSQLMap,
  PostgreSQLType,
} from "../type-maps/postgres-types";
import { CreateTableQueryBuilder } from "./create-table-query-builder";

export class PgCreateTableQueryBuilder implements CreateTableQueryBuilder {
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
        const columnType = OrmTypesToPostgreSQLMap[
          propertyMetadata.type
        ] as PostgreSQLType;
        const primaryKeyOptions = primaryKeyMetadata || {};

        let columnDefinition = `${columnName} ${columnType}`;

        if (columnNotNull && !primaryKeyOptions.autoIncrement) {
          columnDefinition += ` NOT NULL`;
        }

        if (primaryKeyOptions.autoIncrement) {
          if (columnType === "integer") {
            columnDefinition = `${columnName} SERIAL PRIMARY KEY`;
          } else {
            throw new Error(
              "autoIncrement is supported only for columns of type integer."
            );
          }
        } else if (primaryKeyMetadata) {
          columnDefinition += ` PRIMARY KEY`;
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
