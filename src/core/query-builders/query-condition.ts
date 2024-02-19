import { LilORMType } from "../type-maps/lil-orm-types";
import { SQLValue } from "./api-query-language";
import { PropertyMapping } from "./proprety-mapping";
import { WhereQueryBuilder } from "./where-query-builder";

export class QueryCondition<T, K extends keyof T> {
  private whereClauses: string[];
  private propertyMappings: PropertyMapping<T>[];

  constructor(
    private readonly property: K,
    propertyMappings: PropertyMapping<T>[],
    private readonly tableName: string,
    private readonly builder: WhereQueryBuilder<T>
  ) {
    this.whereClauses = [];
    this.propertyMappings = propertyMappings;
  }

  private getColumnName(): string {
    const mapping = this.propertyMappings.find(
      (mappingItem) => mappingItem.entityProperty === this.property
    );
    return `${this.tableName}.${mapping ? mapping.columnName : String(this.property)
      }`;
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

  is(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} IS ${this.formatValue(value)}`);
    return this;
  }

  isNot(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} IS NOT ${this.formatValue(value)}`);
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
    const formattedValues = values
      .map((value) => this.formatValue(value))
      .join(", ");
    this.whereClauses.push(`${columnName} IN (${formattedValues})`);
    return this;
  }

  and<K2 extends keyof T & string>(
    propertySelector: K2
  ): QueryCondition<T, K2> {
    const newCondition = this.builder.where(propertySelector);
    this.builder.getQueryBuilder().internal.addWhereClause(this.buildCondition());
    return newCondition;
  }

  or<K2 extends keyof T & string>(propertySelector: K2): QueryCondition<T, K2> {
    const newCondition = this.builder.where(propertySelector);
    this.builder.getQueryBuilder().internal.addOrWhereClause(this.buildOrCondition());
    return newCondition;
  }

  private formatValue(value: any): string {
    const type = this.propertyMappings.find(
      (mapping) => mapping.entityProperty === this.property
    )?.columnType;

    const queryBuilder = this.builder.getQueryBuilder();
    queryBuilder.internal.addValues(value);
    const placeholder = queryBuilder.internal.getDBSMImpl().preparedStatementPlaceholder(queryBuilder.getValues().length, type as LilORMType);
    return placeholder;
  }

  private buildCondition(): string {
    return this.whereClauses.join(" AND ");
  }

  private buildOrCondition(): string {
    return this.whereClauses.join(" OR ");
  }

  finalize() {
    return this.builder
      .getQueryBuilder()
      .internal.addWhereClause(this.buildCondition());
  }

  build(): { query: string, values: SQLValue[] } {
    this.builder.getQueryBuilder().internal.addWhereClause(this.buildCondition());
    const preparedQuery = this.builder.getQueryBuilder().build();
    return { query: preparedQuery.query, values: preparedQuery.values };
  }
}
