import { DatabaseConnection } from "../database/database-connection";
import { CreateTableQueryBuilder } from "./create-table-query-builder";

export class SchemaGenerator {

    private readonly createTableQueryBuilder: CreateTableQueryBuilder

    constructor(private readonly databaseConnection: DatabaseConnection) {
        this.createTableQueryBuilder = new CreateTableQueryBuilder();
    }

    getTableSql(entityClass: any): string {
        return this.createTableQueryBuilder.createTableSql(entityClass);
    }

    async createTable(entityClass: any): Promise<void> {
        const sql = this.getTableSql(entityClass);
        await this.databaseConnection.executeNonQuery(sql);
    }
}