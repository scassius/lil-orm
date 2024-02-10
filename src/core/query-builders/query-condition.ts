import { EntityTransformer } from "../entity-transformer";
import { PropertyMapping, valueQueryFormatter } from "./proprety-mapping";
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
    return `${this.tableName}.${
      mapping ? mapping.columnName : String(this.property)
    }`;
  }

  private isJSONType(): boolean {
    const type = this.propertyMappings.find(
      (mapping) => mapping.entityProperty === this.property
    )?.columnType;

    return type === "JSON"; // Assumi che "JSON" sia il valore che stai usando per rappresentare il tipo di colonna JSON.
  }

  equals(value: T[K]): QueryCondition<T, K> {
    const columnName = this.getColumnName();

    if (this.isJSONType()) {
      this.whereClauses.push(`${columnName} @> ${this.formatValue(value)}`);
    } else {
      this.whereClauses.push(`${columnName} = ${this.formatValue(value)}`);
    }

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
    this.builder.finalize().internal.addWhereClause(this.buildCondition());
    return newCondition;
  }

  or<K2 extends keyof T & string>(propertySelector: K2): QueryCondition<T, K2> {
    const newCondition = this.builder.where(propertySelector);
    this.builder.finalize().internal.addOrWhereClause(this.buildOrCondition());
    return newCondition;
  }

  private formatValue(value: any): string {
    const type =
      this.propertyMappings.find(
        (mapping) => mapping.entityProperty === this.property
      )?.columnType || "TEXT";

    const formattedValue = EntityTransformer.formatValueToPostgreSQLType(
      value,
      type
    );

    if (this.isJSONType()) {
      return `${formattedValue}::jsonb`;
    }

    return formattedValue;
  }

  private buildCondition(): string {
    return this.whereClauses.join(" AND ");
  }

  private buildOrCondition(): string {
    return this.whereClauses.join(" OR ");
  }

  finalize() {
    return this.builder
      .finalize()
      .internal.addWhereClause(this.buildCondition());
  }

  build(): string {
    this.builder.finalize().internal.addWhereClause(this.buildCondition());
    return this.builder.finalize().build();
  }
}
