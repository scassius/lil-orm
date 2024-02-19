import { MetadataExtractor } from "../metadata/metadata-extractor";
import { OperationType, QueryBuilderAPI } from "./api-query-language";

export class InsertQueryBuilder<T> {
  constructor(
    private readonly entityClass: new () => T extends object ? T : any,
    private readonly queryBuilder: QueryBuilderAPI
  ) {
    this.queryBuilder.forEntity(this.entityClass, OperationType.InsertInto);
  }

  finalize() {
    return this.queryBuilder;
  }

  setObject(object: Partial<T>): InsertQueryBuilder<T> {
    const entityInstance = Object.assign(new this.entityClass(), object);

    MetadataExtractor.processInsert(entityInstance);

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
}
