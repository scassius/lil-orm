import { LilORMType, OrmTypesToPostgreSQLMap, PostgreSQLType } from "../type-maps/sqlite-types";
import { SQLBuilderImpl } from "./sql-builder-implementation";

export class PostgreSQLBuilder extends SQLBuilderImpl {
    
    preparedStatementPlaceholder(index: number, type:LilORMType): string {
        return `$${index}::${this.valueCasting(type)}`;
    }

    private valueCasting(type: LilORMType): PostgreSQLType {
        const postgresType = OrmTypesToPostgreSQLMap[type];
        if (!postgresType) {
            throw new Error(`Unsupported LilORMType: ${type}`);
        }
        return postgresType;
    }
}
