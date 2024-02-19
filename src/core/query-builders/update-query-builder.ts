import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryBuilderAPI, OperationType } from "./api-query-language";
import { QueryCondition } from "./query-condition";
import { WhereQueryBuilder } from "./where-query-builder";

export class UpdateQueryBuilder<T> {
  constructor(
    private readonly entityClass: new () => T extends object ? T : any,
    private readonly queryBuilder: QueryBuilderAPI
  ) {
    this.queryBuilder.forEntity(this.entityClass, OperationType.Update);
  }

  finalize(): QueryBuilderAPI {
    return this.queryBuilder;
  }

  setObject(object: Partial<T>): UpdateQueryBuilder<T> {
    const entityInstance = Object.assign(new this.entityClass(), object);

    MetadataExtractor.processUpdate(entityInstance);

    const metadataValues = MetadataExtractor.getEnrichedEntityColumnsMetadata(entityInstance);

    const filteredValues: any[] = [];
    const filteredColumns: any[] = [];
    const filteredTypes: any[] = [];

    for (let i = 0; i < metadataValues.length; i++) {
      if (metadataValues[i].value !== undefined && !Number.isNaN(metadataValues[i].value)) {
        filteredValues.push(metadataValues[i].value);
        filteredColumns.push(metadataValues[i].name);
        filteredTypes.push(metadataValues[i].type);
      }
    }

    this.queryBuilder.internal.setValues(filteredValues, filteredTypes);
    this.queryBuilder.internal.setColumns(filteredColumns);

    return this;
  }

  where<K extends keyof T & string>(
    propertySelector: K
  ): QueryCondition<T, keyof T & string> {
    const whereQueryBuilder = new WhereQueryBuilder<T>(
      this.entityClass,
      this.queryBuilder
    );
    const queryCondition = whereQueryBuilder.where(propertySelector);
    return queryCondition;
  }
}
