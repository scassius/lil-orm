import { EntityTransformer } from "../entity-transformer";
import { MetadataExtractor } from "../metadata/metadata-extractor";
import { SQLiteDatabase } from "../database/sqlite-provider";
import { Transaction } from "./transaction";
import { DataAccessLayer } from "./data-access-layer";
import { QueryBuilderAPI } from "../query-builders/api-query-language";
import { DatabaseConnection } from "../database/database-connection";
import { QueryCondition, WhereQueryBuilder } from "../query-builders/where-query-builder";
import { UpdateQueryBuilder } from "../query-builders/update-query-builder";
import { DeleteQueryBuilder } from "../query-builders/delete-query-builder";

export class Repository<TEntity> {
  private readonly _tableName: string;
  private dataAccessLayer: DataAccessLayer;
  private queryBuilder: QueryBuilderAPI;

  constructor(
    private readonly entityModel: new () => TEntity extends object
      ? TEntity
      : any,
    private readonly db: DatabaseConnection
  ) {
    this._tableName = MetadataExtractor.getEntityTableName(entityModel);
    this.dataAccessLayer = new DataAccessLayer(this.db);
    this.queryBuilder = new QueryBuilderAPI();
  }

  get dbInstance(): DatabaseConnection {
    return this.db;
  }

  get tableName(): string {
    return this.tableName
  }

  async retrieve(conditionBuilder: (queryBuilder: WhereQueryBuilder<TEntity>) => QueryCondition<TEntity, keyof TEntity>): Promise<TEntity[]> {
    const initialQueryBuilder = new QueryBuilderAPI().forEntity(this.entityModel).finalize();
    const whereQueryBuilder = new WhereQueryBuilder<TEntity>(this.entityModel, initialQueryBuilder);
    
    const finalizedQueryBuilder = conditionBuilder(whereQueryBuilder);

    const results = await this.dataAccessLayer.retrieve(
      finalizedQueryBuilder.finalize(),
      (data) => EntityTransformer.transformSQLEntityToObject<TEntity>(new this.entityModel(), data) 
    );

    return results;
  }


  public async insert(entity: TEntity): Promise<void> {
    const queryBuilder = this.queryBuilder.insertInto<TEntity>(this.entityModel).setObject(entity).finalize();
    await this.dataAccessLayer.insert(queryBuilder);
  }

  public async update(entity: TEntity, conditionBuilder: (whereBuilder: UpdateQueryBuilder<TEntity>) => QueryCondition<TEntity, keyof TEntity>): Promise<void> {
    const whereBuilder = this.queryBuilder.update(this.entityModel).setObject(entity);
    const queryBuilder = conditionBuilder(whereBuilder).finalize();
    await this.dataAccessLayer.update(queryBuilder);
  }

  public async delete(conditionBuilder: (whereBuilder: DeleteQueryBuilder<TEntity>) => QueryCondition<TEntity, keyof TEntity>): Promise<void> {
    const whereBuilder = this.queryBuilder.deleteFrom(this.entityModel);
    const queryBuilder = conditionBuilder(whereBuilder).finalize();
    await this.dataAccessLayer.delete(queryBuilder);
  }
}
