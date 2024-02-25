import { MetadataExtractor } from "../metadata/metadata-extractor";
import { DBSMType, LilORMType } from "../type-maps/lil-orm-types";
import { DeleteQueryBuilder } from "./delete-query-builder";
import { InsertQueryBuilder } from "./insert-query-builder";
import { SQLBuilderFactory } from "../sql-builders-implementation/sql-builder-factory";
import { SQLBuilderImpl } from "../sql-builders-implementation/sql-builder-implementation";
import { UpdateQueryBuilder } from "./update-query-builder";
import { WhereQueryBuilder } from "./where-query-builder";
import { EntityTransformer } from "../../entity-transformer";
import { getPropertyMappings } from "./proprety-mapping";

export enum OperationType {
  Select = "SELECT",
  InsertInto = "INSERT INTO",
  Update = "UPDATE",
  DeleteFrom = "DELETE FROM",
}

export type SQLValue = string | number | boolean | Date | null;

export class QueryBuilderAPI {
  private operationType: OperationType | null;
  private selectColumns: string[];
  private whereClauses: string[];
  private entityQueries: string[];
  private sortColumn: string | null;
  private sortDirection: "ASC" | "DESC" | null;
  private groupByColumns: string[];
  private columns: string[];
  private values: any[];
  private logicOperators: string[];
  private sqlBuilderImpl: SQLBuilderImpl;
  private entityClassWrite: any;

  public internal: {
    setColumns: (columns: string[]) => QueryBuilderAPI;
    setValues: (values: any[], type: LilORMType[]) => QueryBuilderAPI;
    addValues: (values: any[], type: LilORMType[]) => QueryBuilderAPI;
    setOperationType: (operationType: OperationType) => QueryBuilderAPI;
    addOrWhereClause: (orWhereClause: string) => QueryBuilderAPI;
    addWhereClause: (whereClause: string) => QueryBuilderAPI;
    getDBSMImpl: () => SQLBuilderImpl;
  };

  getValues() {
    return this.values;
  }

  constructor(private readonly dbsmType: DBSMType) {
    this.intialize();
    this.sqlBuilderImpl = SQLBuilderFactory.create(dbsmType);
  }

  private intialize() {
    this.whereClauses = [];
    this.entityQueries = [];
    this.sortColumn = null;
    this.sortDirection = null;
    this.groupByColumns = [];
    this.operationType = null;
    this.columns = [];
    this.values = [];
    this.logicOperators = [];
    this.selectColumns = [];

    const self = this;
    this.internal = {
      setColumns(columns: string[]): QueryBuilderAPI {
        self.columns = columns;
        return self;
      },
      setValues(values: any[], types: LilORMType[]): QueryBuilderAPI {
        self.values = values
          ? values.map((value, index) =>
              self.sqlBuilderImpl.prepareValue(value, types[index])
            )
          : [];
        return self;
      },
      addValues(values: any[], types: LilORMType[]): QueryBuilderAPI {
        const preparedValues = values
          ? values.map((value, index) =>
              self.sqlBuilderImpl.prepareValue(value, types[index])
            )
          : [];
        self.values.push(...preparedValues);
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
      },
      getDBSMImpl(): SQLBuilderImpl {
        return self.sqlBuilderImpl;
      },
    };
  }

  dispose() {
    this.intialize();
  }

  public forEntity<T>(
    entityClass: new () => T extends object ? T : any,
    operationType: OperationType = OperationType.Select
  ): WhereQueryBuilder<T> {
    const entityName = MetadataExtractor.getEntityTableName(entityClass);
    this.operationType = operationType;
    const entityQuery = `${entityName}`;
    this.entityQueries.push(entityQuery);
    return new WhereQueryBuilder(entityClass, this);
  }

  public insertInto<T>(
    entityClass: new () => T extends object ? T : any
  ): InsertQueryBuilder<T> {
    this.entityClassWrite = entityClass;
    this.operationType = OperationType.InsertInto;
    return new InsertQueryBuilder(entityClass, this);
  }

  public update<T>(
    entityClass: new () => T extends object ? T : any
  ): UpdateQueryBuilder<T> {
    this.entityClassWrite = entityClass;
    this.operationType = OperationType.Update;
    return new UpdateQueryBuilder(entityClass, this);
  }

  public deleteFrom<T>(
    entityClass: new () => T extends object ? T : any
  ): DeleteQueryBuilder<T> {
    this.operationType = OperationType.DeleteFrom;
    return new DeleteQueryBuilder(entityClass, this);
  }

  public select<T>(columns: (keyof T)[]): QueryBuilderAPI {
    this.selectColumns = columns.map((column) => column.toString());
    return this;
  }

  build(): { query: string; values: SQLValue[] } {
    let values: SQLValue[] = [];
    let fromClause = "";
    const whereClause = this.whereClauses.reduce((acc, clause, i) => {
      if (i === 0) return clause;

      return `${acc} ${this.logicOperators[i - 1]} ${clause}`;
    }, "");

    const whereClauseStr = whereClause ? `WHERE ${whereClause}` : "";
    let buildStr = "";

    switch (this.operationType) {
      case OperationType.Select:
        fromClause = this.entityQueries.join(", ");
        const columnsToSelect =
          this.selectColumns.length > 0 ? this.selectColumns.join(", ") : "*";
        const sortClause = this.sortColumn
          ? `ORDER BY ${this.sortColumn} ${this.sortDirection}`
          : "";
        const groupByClause =
          this.groupByColumns.length > 0
            ? `GROUP BY ${this.groupByColumns.join(", ")}`
            : "";
        buildStr = `SELECT ${columnsToSelect} FROM ${fromClause} ${whereClauseStr} ${sortClause} ${groupByClause}`;
        values = [...this.values];
        break;

      case OperationType.InsertInto:
        fromClause = this.entityQueries[0];

        const columnsClause = `(${this.columns.join(", ")})`;
        const placeholders = this.values
          .map((value, index) => {
            const type = getPropertyMappings(this.entityClassWrite).find(
              (mapping) => mapping.columnName === this.columns[index]
            )?.columnType;
            return this.sqlBuilderImpl.preparedStatementPlaceholder(
              index + 1,
              type as LilORMType,
              value
            );
          })
          .join(", ");

        const valuesClause = `VALUES (${placeholders})`;
        buildStr = `INSERT INTO ${fromClause} ${columnsClause} ${valuesClause}`;
        values = [...this.values];
        break;

      case OperationType.Update:
        fromClause = this.entityQueries[0];

        const setClause = this.columns
          .map((clause, index) => {
            const type = getPropertyMappings(this.entityClassWrite).find(
              (mapping) => mapping.columnName === this.columns[index]
            )?.columnType;
            return `${clause} = ${this.sqlBuilderImpl.preparedStatementPlaceholder(
              index + 1,
              type as LilORMType,
              this.values[index]
            )}`;
          })
          .join(", ");

        buildStr = `UPDATE ${fromClause} SET ${setClause} ${whereClauseStr}`;
        values = [...this.values];
        break;

      case OperationType.DeleteFrom:
        fromClause = this.entityQueries[0];
        buildStr = `DELETE FROM ${fromClause} ${whereClauseStr}`;
        values = [...this.values];
        break;

      default:
        return { query: whereClauseStr, values: [...this.values] };
    }

    this.dispose();
    return { query: buildStr, values };
  }
}
