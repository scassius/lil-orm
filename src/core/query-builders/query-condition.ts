import { LilORMType, TypeScriptToLilORMMap, TypeScriptType } from "../type-maps/lil-orm-types";
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

  jsonContains<P extends keyof T[K]>(path: P, value: any): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    const formattedValue = this.enqueueValueForQuery(value, TypeScriptToLilORMMap[(typeof value) as TypeScriptType]);
    this.whereClauses.push(this.builder.getQueryBuilder().internal.getDBSMImpl().jsonContains(columnName, String(path), formattedValue));
    return this;
  }

  jsonEquals<P extends keyof T[K]>(path: P, value: any): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    const formattedValue = this.enqueueValueForQuery(value, TypeScriptToLilORMMap[(typeof value) as TypeScriptType]);
    this.whereClauses.push(this.builder.getQueryBuilder().internal.getDBSMImpl().jsonEquals(columnName, String(path), formattedValue));
    return this;
  }

  equals(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();

    this.whereClauses.push(`${columnName} = ${this.enqueueValueForQuery(value)}`);

    return this;
  }

  like(value: string): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    const formattedValue = this.enqueueValueForQuery(value);
    this.whereClauses.push(`${columnName} LIKE ${formattedValue}`);
    return this;
  }

  notEquals(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} <> ${this.enqueueValueForQuery(value)}`);
    return this;
  }

  is(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} IS ${this.enqueueValueForQuery(value)}`);
    return this;
  }

  isNot(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} IS NOT ${this.enqueueValueForQuery(value)}`);
    return this;
  }

  greaterThan(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} > ${this.enqueueValueForQuery(value)}`);
    return this;
  }

  lessThan(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    this.whereClauses.push(`${columnName} < ${this.enqueueValueForQuery(value)}`);
    return this;
  }

  in(values: T[K][]): QueryCondition<T, K> {
    const columnName = this.getColumnName();
    const formattedValues = values
      .map((value) => this.enqueueValueForQuery(value))
      .join(", ");
    this.whereClauses.push(`${columnName} IN (${formattedValues})`);
    return this;
  }

  /*and<K2 extends keyof T & string>(
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
  }*/

  or(callback: (qb: WhereQueryBuilder<T>) => QueryCondition<T, keyof T>): QueryCondition<T, K>;
  or<K2 extends keyof T & string>(propertySelector: K2): QueryCondition<T, K2>;
  or<K2 extends keyof T & string>(arg: any): QueryCondition<T, K> | QueryCondition<T, K2> {
    if (typeof arg === 'function') {
      const subQueryBuilder = new WhereQueryBuilder<T>(this.builder.internal.entityClass, this.builder.getQueryBuilder());
      const callbackResult = arg(subQueryBuilder);
      const subQuery = callbackResult.buildSubQuery();
      this.whereClauses.push(`OR (${subQuery})`);
      return this;
    } else {
      this.builder.getQueryBuilder().internal.addOrWhereClause(this.buildOrCondition());
      return this.builder.where(arg);
    }
  }

  and(callback: (qb: WhereQueryBuilder<T>) => QueryCondition<T, keyof T>): QueryCondition<T, K>;
  and<K2 extends keyof T & string>(propertySelector: K2): QueryCondition<T, K2>;
  and<K2 extends keyof T & string>(arg: any): QueryCondition<T, K> | QueryCondition<T, K2> {
    if (typeof arg === 'function') {
      const subQueryBuilder = new WhereQueryBuilder<T>(this.builder.internal.entityClass, this.builder.getQueryBuilder());
      const callbackResult = arg(subQueryBuilder);
      const subQuery = callbackResult.buildSubQuery();
      this.whereClauses.push(`AND (${subQuery})`);
      return this;
    } else {
      this.builder.getQueryBuilder().internal.addWhereClause(this.buildOrCondition());
      return this.builder.where(arg);
    }
  }

  private enqueueValueForQuery(value: any, forcedType?: LilORMType): string {
    let type = forcedType;
    if (!forcedType) {
      type = this.propertyMappings.find(
        (mapping) => mapping.entityProperty === this.property
      )?.columnType;
    }

    const queryBuilder = this.builder.getQueryBuilder();
    queryBuilder.internal.addValues([value], [type as LilORMType]);
    const placeholder = queryBuilder.internal.getDBSMImpl().preparedStatementPlaceholder(queryBuilder.getValues().length, type as LilORMType);
    return placeholder;
  }

  private buildCondition(): string {
    return this.whereClauses.join(" AND ");
  }

  private buildOrCondition(): string {
    return this.whereClauses.join(" OR ");
  }

  done() {
    return this.builder;
  }

  buildSubQuery(): string {
    return this.whereClauses.join(' ');
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
