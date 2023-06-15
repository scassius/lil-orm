import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryCondition, WhereQueryBuilder } from "./where-query-builder";

export class UpdateQueryBuilder<T> {
    private values: Partial<T>;
    private whereConditions: string[];

    constructor(private readonly entityClass: new () => T extends object ? T : any) {
        this.values = {};
        this.whereConditions = [];
    }

    setObject(object: Partial<T>): UpdateQueryBuilder<T> {
        this.values = object;
        return this;
    }

    where<K extends keyof T & string>(propertySelector: K): QueryCondition<T, keyof T & string> {
        const whereQueryBuilder = new WhereQueryBuilder<T>(this.entityClass);
        const queryCondition = whereQueryBuilder.where(propertySelector);
        this.whereConditions.push(queryCondition.build());
        return queryCondition;
    }

    build(): string {
        const entityName = MetadataExtractor.getEntityTableName(this.entityClass);
        const setClause = Object.entries(this.values)
            .map(([property, value]) => `${property} = ${typeof value === "string" ? `'${value}'` : value}`)
            .join(", ");
        const whereClause = this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";

        return `UPDATE ${entityName} SET ${setClause} ${whereClause}`;
    }
}

/**
 * // Update query
const updateQuery = queryBuilder
  .update(UserEntity)
  .setObject(user)
  .where((x) => x.id).equals(1)
  .where((x) => x.isActive).equals(true)
  .build();

 */