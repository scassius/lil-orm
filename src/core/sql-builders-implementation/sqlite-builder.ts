import { LilORMType } from "../type-maps/sqlite-types";
import { SQLBuilderImpl } from "./sql-builder-implementation";

export class SQLiteBuilder extends SQLBuilderImpl {

    preparedStatementPlaceholder(index: number, type:LilORMType): string {
        return `?`;
    }
}
