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
    const values = MetadataExtractor.getEntityValues(entityInstance);
    const columns: any[] =
      MetadataExtractor.getEntityColumnsName(entityInstance);

    const filteredValues: any[] = [];
    const filteredColumns: any[] = [];

    for (let i = 0; i < values.length; i++) {
      if (values[i] !== undefined && !Number.isNaN(values[i])) {
        filteredValues.push(values[i]);
        filteredColumns.push(columns[i]);
      }
    }

    this.queryBuilder.internal.setValues(filteredValues);
    this.queryBuilder.internal.setColumns(filteredColumns);

    return this;
  }
}
