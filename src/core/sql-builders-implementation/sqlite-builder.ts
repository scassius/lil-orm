import { LilORMType } from "../types";
import { SQLBuilderImpl } from "./sql-builder-implementation";

export class SQLiteBuilder extends SQLBuilderImpl {

    preparedStatementPlaceholder(index: number, type:LilORMType): string {
        return `?`;
    }
}
