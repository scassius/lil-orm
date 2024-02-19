import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryBuilderAPI } from "./api-query-language";
import { PropertyMapping, getPropertyMappings } from "./proprety-mapping";
import { QueryCondition } from "./query-condition";

export class WhereQueryBuilder<T> {
  private tableName: string;
  private propertyMappings: PropertyMapping<T>[];

  public internal: {
    entityClass: new () => T extends object ? T : any;
  };

  constructor(
    entityClass: new () => T extends object ? T : any,
    private readonly queryBuilder: QueryBuilderAPI
  ) {
    this.tableName = MetadataExtractor.getEntityTableName(entityClass);
    this.propertyMappings = getPropertyMappings(entityClass);
    this.internal = {
      entityClass,
    };
  }

  where<K extends keyof T & string>(propertySelector: K): QueryCondition<T, K> {
    const propertyName = propertySelector;
    return new QueryCondition<T, K>(
      propertyName,
      this.propertyMappings,
      this.tableName,
      this
    );
  }

  getQueryBuilder() {
    return this.queryBuilder;
  }
}
