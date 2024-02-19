import { DBSMType, LilORMType } from "../type-maps/sqlite-types";

export abstract class SQLBuilderImpl {
    abstract preparedStatementPlaceholder(index: number, type:LilORMType): string;
}
