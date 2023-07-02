import { MetadataExtractor } from "../metadata/metadata-extractor";
import { DeleteQueryBuilder } from "./delete-query-builder";
import { InsertQueryBuilder } from "./insert-query-builder";
import { UpdateQueryBuilder } from "./update-query-builder";
import { WhereQueryBuilder } from "./where-query-builder";

export enum OperationType {
  Select = "SELECT",
  InsertInto = "INSERT INTO",
  Update = "UPDATE",
  DeleteFrom = "DELETE FROM",
}

export class QueryBuilderAPI {
  private operationType: OperationType | null;
  private whereClauses: string[];
  private entityQueries: string[];
  private sortColumn: string | null;
  private sortDirection: "ASC" | "DESC" | null;
  private groupByColumns: string[];
  private columns: string[];
  private values: any[];
  private setClauses: string[];
  private logicOperators: string[];

  public internal: {
    setColumns: (columns: string[]) => QueryBuilderAPI;
    setValues: (values: string[]) => QueryBuilderAPI;
    setSetClauses: (setClauses: string[]) => QueryBuilderAPI;
    setOperationType: (operationType: OperationType) => QueryBuilderAPI;
    addOrWhereClause: (orWhereClause: string) => QueryBuilderAPI;
    addWhereClause: (whereClause: string) => QueryBuilderAPI;
  };

  constructor() {
    this.whereClauses = [];
    this.entityQueries = [];
    this.sortColumn = null;
    this.sortDirection = null;
    this.groupByColumns = [];
    this.operationType = null;
    this.setClauses = [];
    this.columns = [];
    this.values = [];
    this.logicOperators = [];

    const self = this;
    this.internal = {
      setColumns(columns: string[]): QueryBuilderAPI {
        self.columns = columns;
        return self;
      },
      setValues(values: string[]): QueryBuilderAPI {
        self.values = values;
        return self;
      },
      setSetClauses(setClauses: string[]): QueryBuilderAPI {
        self.setClauses = setClauses;
        return self;
      },
      setOperationType(operationType: OperationType): QueryBuilderAPI {
        self.operationType = operationType;
        return self;
      },
      addOrWhereClause(orWhereClause: string): QueryBuilderAPI {
        if (orWhereClause !== "") {
          self.whereClauses.push(orWhereClause);
          self.logicOperators.push("OR");
        }
        return self;
      },
      addWhereClause(whereClause: string): QueryBuilderAPI {
        if (whereClause !== "") {
          self.whereClauses.push(whereClause);
          self.logicOperators.push("AND");
        }
        return self;
      }
    };
  }

  forEntity<T>(
    entityClass: new () => T extends object ? T : any,
    operationType: OperationType = OperationType.Select
  ): WhereQueryBuilder<T> {
    const entityName = MetadataExtractor.getEntityTableName(entityClass);
    this.operationType = operationType;
    const entityQuery = `${entityName}`;
    this.entityQueries.push(entityQuery);
    return new WhereQueryBuilder(entityClass, this);
  }

  insertInto<T>(
    entityClass: new () => T extends object ? T : any
  ): InsertQueryBuilder<T> {
    this.operationType = OperationType.InsertInto;
    return new InsertQueryBuilder(entityClass, this);
  }

  update<T>(
    entityClass: new () => T extends object ? T : any
  ): UpdateQueryBuilder<T> {
    this.operationType = OperationType.Update;
    return new UpdateQueryBuilder(entityClass, this);
  }

  deleteFrom<T>(
    entityClass: new () => T extends object ? T : any
  ): DeleteQueryBuilder<T> {
    this.operationType = OperationType.DeleteFrom;
    return new DeleteQueryBuilder(entityClass, this);
  }

  build(): string {
    let fromClause = "";
    const whereClause = this.whereClauses.reduce((acc, clause, i) => {
      if (i === 0) return clause;

      return `${acc} ${this.logicOperators[i - 1]} ${clause}`;
    }, "");

    const whereClauseStr = whereClause ? `WHERE ${whereClause}` : "";

    switch (this.operationType) {
      case OperationType.Select:
        fromClause = this.entityQueries.join(", ");
        const sortClause = this.sortColumn
          ? `ORDER BY ${this.sortColumn} ${this.sortDirection}`
          : "";
        const groupByClause =
          this.groupByColumns.length > 0
            ? `GROUP BY ${this.groupByColumns.join(", ")}`
            : "";
        return `SELECT * FROM ${fromClause} ${whereClauseStr} ${sortClause} ${groupByClause}`;

      case OperationType.InsertInto:
        fromClause = this.entityQueries[0];
        const columnsClause = `(${this.columns.join(", ")})`;
        const valuesClause = `VALUES (${this.values.join(", ")})`;
        return `INSERT INTO ${fromClause} ${columnsClause} ${valuesClause}`;

      case OperationType.Update:
        fromClause = this.entityQueries[0];
        const setClause = `SET ${this.setClauses.join(", ")}`;
        return `UPDATE ${fromClause} ${setClause} ${whereClauseStr}`;

      case OperationType.DeleteFrom:
        fromClause = this.entityQueries[0];
        return `DELETE FROM ${fromClause} ${whereClauseStr}`;

      default:
        throw new Error("Invalid operation type");
    }
  }
}
