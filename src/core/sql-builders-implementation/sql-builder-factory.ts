import { DBSMType } from "../types";
import { PostgreSQLBuilder } from "./postgresql-builder";
import { SQLBuilderImpl } from "./sql-builder-implementation";
import { SQLiteBuilder } from "./sqlite-builder";

export class SQLBuilderFactory {
    
    static create(dbsmType: DBSMType): SQLBuilderImpl {
        switch (dbsmType) {
            case 'postgresql':
                return new PostgreSQLBuilder();
            case 'sqlite':
                return new SQLiteBuilder();
            default:
                throw new Error(`Unsupported DBMS Type: ${dbsmType}`);
        }
    }
}