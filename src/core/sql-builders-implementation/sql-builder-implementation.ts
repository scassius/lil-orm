import { DBSMType, LilORMType } from "../type-maps/lil-orm-types";

export abstract class SQLBuilderImpl {
  abstract preparedStatementPlaceholder(
    index: number,
    type: LilORMType,
    value: any
  ): string;
  abstract prepareValue(value: any, type: LilORMType): any;
  abstract jsonEquals(columnName: string, path: string, value: any): string;
  abstract jsonContains(columnName: string, path: string, value: any): string;
}
