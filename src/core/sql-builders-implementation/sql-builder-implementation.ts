import { DBSMType, LilORMType } from "../types";

export abstract class SQLBuilderImpl {
    abstract preparedStatementPlaceholder(index: number, type:LilORMType): string;
}
