import { DatabaseConnection } from "../database/database-connection";
import { DBSMType } from "../type-maps/lil-orm-types";
import { CreateTableQueryBuilder } from "./create-table-query-builder";
import { PgCreateTableQueryBuilder } from "./pg-create-table-query-builder";
import { SQLiteCreateTableQueryBuilder } from "./sqlite-create-table-query-builder";

export class SchemaGenerator {
  private readonly createTableQueryBuilder: CreateTableQueryBuilder;

  constructor(private readonly databaseConnection: DatabaseConnection, private readonly driver: DBSMType) {
    switch (driver) {
      case 'postgresql':
        this.createTableQueryBuilder = new PgCreateTableQueryBuilder();
        break;
      case 'sqlite':
        this.createTableQueryBuilder = new SQLiteCreateTableQueryBuilder();
        break;
    }
  }

  getTableSql(entityClass: any): string {
    return this.createTableQueryBuilder.createTableSql(entityClass);
  }

  async createTable(entityClass: any): Promise<void> {
    const sql = this.getTableSql(entityClass);
    await this.databaseConnection.executeNonQuery(sql, []);
  }
}
