import { MetadataExtractor } from "../metadata/metadata-extractor";
import { DataAccessLayer } from "./data-access-layer";
import {
  OperationType,
  QueryBuilderAPI,
} from "../query-builders/api-query-language";
import { DatabaseConnection } from "../database/database-connection";
import { WhereQueryBuilder } from "../query-builders/where-query-builder";
import { UpdateQueryBuilder } from "../query-builders/update-query-builder";
import { QueryCondition } from "../query-builders/query-condition";
import { DBSMType } from "../type-maps/lil-orm-types";
import { EntityTransformer } from "../../entity-transformer";
import _ from 'lodash';

export class Repository<TEntity> {
  private readonly _tableName: string;
  private dataAccessLayer: DataAccessLayer;
  private queryBuilder: QueryBuilderAPI;
  private debugMode: boolean = false;

  public debugSQLQuery: { query: string, values: any }[] = [];

  constructor(
    private readonly entityModel: new () => TEntity extends object
      ? TEntity
      : any,
    private readonly db: DatabaseConnection,
    private readonly dbsm: DBSMType
  ) {
    this._tableName = MetadataExtractor.getEntityTableName(entityModel);
    this.dataAccessLayer = new DataAccessLayer(this.db);
    this.queryBuilder = new QueryBuilderAPI(this.dbsm);
  }

  get dbInstance(): DatabaseConnection {
    return this.db;
  }

  get tableName(): string {
    return this.tableName;
  }

  public enableDebugMode() {
    this.debugMode = true;
  }

  private logDebugQuery(queryBuilder: QueryBuilderAPI[]) {
    if (this.debugMode) {
      const queryCopy = _.cloneDeep(queryBuilder);
      queryCopy.forEach((query) => {
        this.debugSQLQuery.push(query.build());
      })
    }
  }

  async retrieve(
    conditionBuilder: (
      queryBuilder: WhereQueryBuilder<TEntity>
    ) => QueryCondition<TEntity, keyof TEntity>
  ): Promise<TEntity[]> {
    const initialQueryBuilder = new QueryBuilderAPI(this.dbsm)
      .forEntity(this.entityModel)
      .getQueryBuilder();
    const whereQueryBuilder = new WhereQueryBuilder<TEntity>(
      this.entityModel,
      initialQueryBuilder
    );

    const finalizedQueryBuilder = conditionBuilder(whereQueryBuilder).finalize();

    this.logDebugQuery([finalizedQueryBuilder]);

    const results = await this.dataAccessLayer.retrieve(
      finalizedQueryBuilder,
      (data) =>
        EntityTransformer.sqlEntityToObj<TEntity>(new this.entityModel(), data)
    );

    return results;
  }

  public async insert(entityOrEntities: Partial<TEntity> | Partial<TEntity>[]): Promise<void> {
    const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

    if (entities.length === 0) {
      throw new Error("No entities provided for insertion.");
    }

    let queries: QueryBuilderAPI[] = [];

    entities.forEach((entityObj, index) => {
      queries.push(this.queryBuilder.insertInto<TEntity>(this.entityModel).setObject(entityObj).finalize())
    });

    this.logDebugQuery(queries);

    await this.dataAccessLayer.insert(queries);
  }

  public async update(
    entityObj: Partial<TEntity>,
    conditionBuilder: (
      whereBuilder: UpdateQueryBuilder<TEntity>
    ) => QueryCondition<TEntity, keyof TEntity>
  ): Promise<void> {
    const whereBuilder = this.queryBuilder
      .update(this.entityModel)
      .setObject(entityObj);
    const queryBuilder = conditionBuilder(whereBuilder).finalize();

    this.logDebugQuery([queryBuilder]);

    await this.dataAccessLayer.update(queryBuilder);
  }

  public async delete(
    conditionBuilder: (
      whereBuilder: WhereQueryBuilder<TEntity>
    ) => QueryCondition<TEntity, keyof TEntity>
  ): Promise<void> {
    const whereBuilder = this.queryBuilder.forEntity(
      this.entityModel,
      OperationType.DeleteFrom
    );
    const queryBuilder = conditionBuilder(whereBuilder).finalize();

    this.logDebugQuery([queryBuilder]);

    await this.dataAccessLayer.delete(queryBuilder);
  }
}
