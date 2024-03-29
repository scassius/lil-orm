import { LilORMType } from "../type-maps/lil-orm-types";
import {
  OrmTypesToPostgreSQLMap,
  PostgreSQLType,
} from "../type-maps/postgres-types";
import { SQLBuilderImpl } from "./sql-builder-implementation";
import { formatISO, parseISO } from "date-fns";

export class PostgreSQLBuilder implements SQLBuilderImpl {
  preparedStatementPlaceholder(
    index: number,
    type: LilORMType,
    value: any
  ): string {
    if (value == null) {
      return `$${index}`;
    }
    return `$${index}::${this.valueCasting(type)}`;
  }

  private valueCasting(type: LilORMType): PostgreSQLType {
    const postgresType = OrmTypesToPostgreSQLMap[type];
    if (!postgresType) {
      throw new Error(`Unsupported LilORMType: ${type}`);
    }
    return postgresType;
  }

  jsonEquals(columnName: string, path: string, value: string): string {
    return `${columnName} ->> '${path}' = ${value}`;
  }

  jsonContains(columnName: string, path: string, value: string): string {
    return `${columnName} @> jsonb_build_object('${path}', ${value})`;
  }

  prepareValue(value: any, type: LilORMType): any {
    if(value == null) {
      return null;
    }
    
    switch (type) {
      case "boolean":
        return value;
      case "json":
        return JSON.stringify(value);
      case "date":
      case "timestamp":
        return formatISO(new Date(value));
      case "uuid":
      case "varchar":
      case "char":
      case "text":
      case "enum":
      case "time":
        return value?.toString();
      case "array":
        return `{${value.join(",")}}`;
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
        throw new Error(`Unsupported type for PostgreSQL: ${type}`);
    }
  }
}
