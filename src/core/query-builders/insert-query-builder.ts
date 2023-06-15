import { MetadataExtractor } from "../metadata/metadata-extractor";

export class InsertQueryBuilder<T> {
    private values: Partial<T>;

    constructor(private readonly entityClass: new () => T) {
        this.values = {};
    }

    setObject(object: Partial<T>): InsertQueryBuilder<T> {
        this.values = object;
        return this;
    }

    build(): string {
        const entityName =  MetadataExtractor.getEntityTableName(this.entityClass);
        const columns = Object.keys(this.values).join(", ");
        const values = Object.values(this.values)
            .map((value) => (typeof value === "string" ? `'${value}'` : value))
            .join(", ");

        return `INSERT INTO ${entityName} (${columns}) VALUES (${values})`;
    }
}

/**
 * const insertQuery = queryBuilder
  .insertInto(UserEntity)
  .setObject(user)
  .build();
 */