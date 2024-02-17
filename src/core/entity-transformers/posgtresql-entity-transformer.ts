import { formatISO, parseISO } from "date-fns";
import { COLUMN_METADATA_KEY } from "../metadata/constants";
import { TypesHelper } from "../types-helper";
import { LilORMType, OrmTypesToPostgreSQLMap } from "../types";
import { EntityTransformer } from "./entity-transformer";

export class PostgreSQLEntityTransformer implements EntityTransformer {
  
  formatValue(value: any, type: LilORMType) {
    throw new Error("Method not implemented.");
  }

  sqlEntityToObj<TEntity>(entityInstance: any, values: any): TEntity {
    const properties = Object.keys(entityInstance);
    const entity: any = {};

    for (const propertyKey of properties) {
      const columnMetadata = Reflect.getMetadata(
        COLUMN_METADATA_KEY,
        entityInstance,
        propertyKey
      );
      if (columnMetadata) {
        const columnName = columnMetadata.name || propertyKey.toString();
        entity[propertyKey] = this.formatValueToPostgreSQLType(
          values[columnName],
          columnMetadata.type
        );
      }
    }

    return entity as TEntity;
  }

  valueQueryFormatter(value: any): string {
    if (value === null) return `NULL`;
    if (TypesHelper.isString(value)) return `'${value}'`;
    if (TypesHelper.isDate(value)) return `'${formatISO(parseISO(value))}'`;
    if (TypesHelper.isBoolean(value)) return value ? 'TRUE' : 'FALSE';
    if (TypesHelper.isNumber(value)) return value.toString();
    if (TypesHelper.isJSONObject(value)) return `'${JSON.stringify(value)}'`;
    throw new Error("Not supported type");
  }

  formatValueToPostgreSQLType(value: any, type: LilORMType): any {
    if (value === undefined || Number.isNaN(value)) return undefined;
    if (value === null) return "NULL";

    const postgresType = OrmTypesToPostgreSQLMap[type];
    switch (postgresType) {
      case "integer":
      case "numeric":
      case "real":
      case "double precision":
      case "bit":
      case "money":
        return value.toString();
      case "boolean":
        return value ? 'TRUE' : 'FALSE';
      case "timestamp":
      case "time":
        return `'${formatISO(parseISO(value))}'`;
      case "text":
      case "char":
      case "varchar":
      case "xml":
      case "uuid":
        return `'${value}'`;
      case "bytea":
        return `'\\x${value.toString("hex")}'`;
      case "jsonb":
        return `'${JSON.stringify(value)}'`;
      case "text[]":
        return `ARRAY[${value.map((v: any) => `'${v}'`).join(", ")}]`;
      case "geometry":
      case "geography":
      case "inet":
      case "cidr":
        return value;
      default:
        throw new Error(`Unsupported PostgreSQLType: ${postgresType}`);
    }
  }
}
