import { PropertyMapping, getPropertyMappings } from "./proprety-mapping";

export class WhereQueryBuilder<T> {
    private propertyMappings: PropertyMapping<T>[];

    constructor(entityClass: new () => T extends object ? T : any) {
        this.propertyMappings = getPropertyMappings(entityClass);
    }

    where<K extends keyof T & string>(propertySelector: (entity: T) => K): QueryCondition<T, K> {
        const propertyName = propertySelector((null as unknown) as T);
        return new QueryCondition<T, K>(propertyName, this.propertyMappings);
    }
}

export class QueryCondition<T, K extends keyof T & string> {
    private whereClauses: string[];
    private propertyMappings: PropertyMapping<T>[];

    constructor(private readonly property: K, propertyMappings: PropertyMapping<T>[]) {
        this.whereClauses = [];
        this.propertyMappings = propertyMappings;
    }

    private getColumnName(): string {
        const mapping = this.propertyMappings.find(
            (mapping) => mapping.entityProperty === this.property
        );
        return mapping ? mapping.columnName : String(this.property);
    }

    equals(value: T[K]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        this.whereClauses.push(`${columnName} = ${this.formatValue(value)}`);
        return this;
    }

    notEquals(value: T[K]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        this.whereClauses.push(`${columnName} <> ${this.formatValue(value)}`);
        return this;
    }

    greaterThan(value: T[K]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        this.whereClauses.push(`${columnName} > ${this.formatValue(value)}`);
        return this;
    }

    lessThan(value: T[K]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        this.whereClauses.push(`${columnName} < ${this.formatValue(value)}`);
        return this;
    }

    in(values: T[K][]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        const formattedValues = values.map((value) => this.formatValue(value)).join(", ");
        this.whereClauses.push(`${columnName} IN (${formattedValues})`);
        return this;
    }

    private formatValue(value: any): string {
        if (typeof value === "string") {
            return `'${value}'`;
        } else if (typeof value === "boolean") {
            return value ? "1" : "0";
        } else if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        } else {
            return String(value);
        }
    }

    build(): string {
        return this.whereClauses.join(" AND ");
    }
}



/**
 *const whereClause = new WhereQueryBuilder<UserEntity>()
  .where("id").equals(1)
  .where("createdAt").greaterThan(new Date("2023-06-14"))
  .where("name").in(["John", "Jane"])
  .build();
 */
