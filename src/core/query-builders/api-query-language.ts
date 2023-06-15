import { MetadataExtractor } from "../metadata/metadata-extractor";
import { DeleteQueryBuilder } from "./delete-query-builder";
import { InsertQueryBuilder } from "./insert-query-builder";
import { UpdateQueryBuilder } from "./update-query-builder";
import { WhereQueryBuilder } from "./where-query-builder";

export class QueryBuilderAPI {
    private entityQueries: string[];
    private sortColumn: string | null;
    private sortDirection: "ASC" | "DESC" | null;
    private groupByColumns: string[];

    constructor() {
        this.entityQueries = [];
        this.sortColumn = null;
        this.sortDirection = null;
        this.groupByColumns = [];
    }

    forEntity<T>(entityClass: new () => T extends object ? T : any): WhereQueryBuilder<T> {
        const entityName = MetadataExtractor.getEntityTableName(entityClass);
        const entityQuery = `FROM ${entityName}`;
        this.entityQueries.push(entityQuery);
        return new WhereQueryBuilder(entityClass, this);
    }

    /*orderBy(column: string, direction: "ASC" | "DESC"): QueryBuilderAPI {
        this.sortColumn = column;
        this.sortDirection = direction;
        return this;
    }

    groupBy(...columns: string[]): QueryBuilderAPI {
        this.groupByColumns = columns;
        return this;
    }*/

    insertInto<T>(entityClass: new () => T): InsertQueryBuilder<T> {
        return new InsertQueryBuilder(entityClass);
    }

    update<T>(entityClass: new () => T extends object ? T : any): UpdateQueryBuilder<T> {
        return new UpdateQueryBuilder(entityClass);
    }

    deleteFrom<T>(entityClass: new () => T extends object ? T : any): DeleteQueryBuilder<T> {
        return new DeleteQueryBuilder(entityClass);
    }

    build(): string {
        const fromClause = this.entityQueries.join(", ");
        const sortClause = this.sortColumn ? `ORDER BY ${this.sortColumn} ${this.sortDirection}` : "";
        const groupByClause = this.groupByColumns.length > 0 ? `GROUP BY ${this.groupByColumns.join(", ")}` : "";

        return `SELECT * ${fromClause} ${sortClause} ${groupByClause}`;
    }
}

/*

const query = new QueryBuilderAPI()
  .forEntity(UserEntity)
  .where((x) => x.id).equals(1)
  .forEntity(ProductEntity)
  .where((x) => x.name).equals("Product 1")
  .orderBy("name", "ASC")
  .groupBy("id", "name")
  .build(); */