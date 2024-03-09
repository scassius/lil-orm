import { MetadataExtractor } from "../metadata/metadata-extractor";
import { ColumnMetadata } from "../type-maps/lil-orm-types";
import { OperationType, QueryBuilderAPI } from "./api-query-language";

export class InsertQueryBuilder<T> {

  private columns: ColumnMetadata[] = [];

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

    this.columns = MetadataExtractor.getEnrichedEntityColumnsMetadata(entityInstance);
    const filteredValues = new Array<any>(this.columns.length);
    const filteredTypes: any[] = new Array<any>(this.columns.length);

    for (const metadataValue of this.columns) {
      const index = this.columns.findIndex(col => col.name === metadataValue.name);

      if (
        metadataValue.value !== undefined &&
        !Number.isNaN(metadataValue.value)
      ) {

        filteredValues[index] =  this.columns[index].value;
        filteredTypes[index] = this.columns[index].type;
      } else {
        filteredValues[index] = null;
        filteredTypes[index] = null;
      }
    }

    this.queryBuilder.internal.setValues(filteredValues, filteredTypes);
    this.queryBuilder.internal.setColumns(this.columns.map((column) => `"${column.name}"`));

    return this;
  }

  addValues(object: Partial<T>): InsertQueryBuilder<T> {
    const entityInstance = Object.assign(new this.entityClass(), object);

    MetadataExtractor.processInsert(entityInstance);

    const metadataValues = MetadataExtractor.getEnrichedEntityColumnsMetadata(entityInstance);

    const filteredValues = new Array<any>(this.columns.length);
    const filteredTypes: any[] = new Array<any>(this.columns.length);

    for (const metadataValue of metadataValues) {
      const index = this.columns.findIndex(col => col.name === metadataValue.name);

      if (
        metadataValue.value !== undefined &&
        !Number.isNaN(metadataValue.value)
      ) {
        filteredValues[index] = metadataValue.value;
        filteredTypes[index] = this.columns[index].type;
      } else {
        filteredValues[index] = null;
        filteredTypes[index] = null;
      }
    }

    this.queryBuilder.internal.addInsertValues(filteredValues, filteredTypes);

    return this;
  }
}
