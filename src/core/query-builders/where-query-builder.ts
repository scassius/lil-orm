import { EntityTransformer } from "../entity-transformer";
import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryBuilderAPI } from "./api-query-language";
import { PropertyMapping, getPropertyMappings, valueQueryFormatter } from "./proprety-mapping";

export class WhereQueryBuilder<T> {
    private tableName: string;
    private propertyMappings: PropertyMapping<T>[];

    constructor(entityClass: new () => T extends object ? T : any, private readonly queryBuilder: QueryBuilderAPI) {
        this.tableName = MetadataExtractor.getEntityTableName(entityClass);
        this.propertyMappings = getPropertyMappings(entityClass);
    }

    where<K extends keyof T & string>(propertySelector: K): QueryCondition<T, K> {
        const propertyName = propertySelector;
        return new QueryCondition<T, K>(propertyName, this.propertyMappings, this.tableName, this);
    }

    finalize() {
        return this.queryBuilder;
    }
}

export class QueryCondition<T, K extends keyof T> {
    private whereClauses: string[];
    private propertyMappings: PropertyMapping<T>[];

    constructor(private readonly property: K, propertyMappings: PropertyMapping<T>[], private readonly tableName: string, private readonly builder: WhereQueryBuilder<T>) {
        this.whereClauses = [];
        this.propertyMappings = propertyMappings;
    }

    private getColumnName(): string {
        const mapping = this.propertyMappings.find(
            (mapping) => mapping.entityProperty === this.property
        );
        return `${this.tableName}.${mapping ? mapping.columnName : String(this.property)}`;
    }

    equals(value: T[K]): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        this.whereClauses.push(`${columnName} = ${this.formatValue(value)}`);
        return this;
    }

    like(value: string): QueryCondition<T, K> {
        const columnName = this.getColumnName();
        const formattedValue = this.formatValue(value);
        this.whereClauses.push(`${columnName} LIKE ${formattedValue}`);
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

    and<K extends keyof T & string>(propertySelector: K): QueryCondition<T, K> {
        const newCondition = this.builder.where(propertySelector);
        this.builder.finalize().internal.addWhereClause(this.buildCondition());
        return newCondition;
    }

    or<K extends keyof T & string>(propertySelector: K): QueryCondition<T, K> {
        const newCondition = this.builder.where(propertySelector);
        this.builder.finalize().internal.addOrWhereClause(this.buildOrCondition());
        return newCondition;
    }

    private formatValue(value: any): string {
        const type = this.propertyMappings.find(
            (mapping) => mapping.entityProperty === this.property
        )?.columnType || 'TEXT';
        return valueQueryFormatter(EntityTransformer.formatValueToSQLiteType(value, type));
    }

    private buildCondition(): string {
        return this.whereClauses.join(" AND ");
    }

    private buildOrCondition(): string {
        return this.whereClauses.join(" OR ");
    }

    finalize() {
        return this.builder.finalize().internal.addWhereClause(this.buildCondition());
    }

    build(): string {
        this.builder.finalize().internal.addWhereClause(this.buildCondition());
        return this.builder.finalize().build();
    }
}