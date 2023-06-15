import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryCondition, WhereQueryBuilder } from "./where-query-builder";

export class DeleteQueryBuilder<T> {
    private tableName: string;
    private whereConditions: string[];

    constructor(private readonly entityClass: new () => T extends object ? T : any) {
        this.tableName = MetadataExtractor.getEntityTableName(this.entityClass)
        this.whereConditions = [];
    }

    where<K extends keyof T & string>(propertySelector: K): QueryCondition<T, keyof T & string> {
        const whereQueryBuilder = new WhereQueryBuilder<T>(this.entityClass);
        const queryCondition = whereQueryBuilder.where(propertySelector);
        this.whereConditions.push(queryCondition.build());
        return queryCondition;
    }

    build(): string {
        const whereClause = this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";
        return `DELETE FROM ${this.tableName} ${whereClause}`;
    }
}

/**
 * const deleteQuery = queryBuilder
  .deleteFrom(UserEntity)
  .where('id').equals(1)
  .build();
 */