import { LilORMType } from "../type-maps/lil-orm-types";
import { SQLBuilderImpl } from "./sql-builder-implementation";

export class SQLiteBuilder extends SQLBuilderImpl {
  preparedStatementPlaceholder(index: number, type: LilORMType): string {
    return `?`;
  }

  jsonEquals(columnName: string, path: string, value: string): string {
    return `json_extract(${columnName}, '$.${path}') = ${value}`;
  }

  jsonContains(columnName: string, path: string, value: string): string {
    return `json_extract(${columnName}, '$.${path}') = ${value}`;
  }

  prepareValue(value: any, type: LilORMType): any {
    switch (type) {
      case "boolean":
        return value ? 1 : 0;
      case "json":
        return JSON.stringify(value);
      case "date":
      case "timestamp":
        return value instanceof Date ? value.toISOString() : value;
      case "uuid":
      case "varchar":
      case "char":
      case "text":
      case "enum":
      case "array":
        return value?.toString();
      case "binary":
        return value;
      case "integer":
      case "real":
      case "blob":
      case "decimal":
      case "float":
      case "double":
      case "money":
      case "bit":
        return value;
      default:
        return value.toString();
    }
  }
}
