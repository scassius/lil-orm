import { EntityTransformer } from './entity-transformer';
import { escapeValue } from './helper';
import { MetadataExtractor } from './metadata';
import { QueryBuilder } from './query-builder';
import { SQLiteDatabase } from './sqlite-database';
import { Trasnaction } from './transaction';

export class Repository<TEntity> {
  private readonly tableName: string;

  constructor(
    private readonly entityModel: new () => TEntity extends object ? TEntity : any,
    private readonly db: SQLiteDatabase,
  ) {
    this.tableName = MetadataExtractor.getEntityTableName(entityModel);
  }

  get dbInstance(): SQLiteDatabase {
    return this.db;
  }

  find(conditions: Partial<TEntity>): Promise<TEntity[]> {
    return new Promise(async (resolve, reject) => {
      const whereClause = Object.entries(conditions)
        .map(([key, value]) => `${key} = ${escapeValue(value)}`)
        .join(' AND ');
      const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
      const res = await this.db.query<TEntity>(query, this.entityModel);
      resolve(res?.rows);
    });
  }

  findOne(conditions: Partial<TEntity>): Promise<TEntity | null> {
    return new Promise(async (resolve, reject) => {
      const whereClause = Object.entries(conditions)
        .map(([key, value]) => `${key} = ${escapeValue(value)}`)
        .join(' AND ');
      const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
      const res = await this.db.query<TEntity>(query, this.entityModel);

      resolve(res?.rows?.[0] ?? null);
    });
  }

  findAll(): Promise<TEntity[]> {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM ${this.tableName}`;
      const res = await this.db.query<TEntity>(query, this.entityModel);

      resolve(res?.rows);
    });
  }

  create(entity: TEntity extends {} ? TEntity : any, transaction?: Trasnaction): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = QueryBuilder.insertSql(entity as TEntity, this.entityModel);
      if (transaction) {
        transaction.addQuery(query);
        resolve();
        return;
      }

      this.db.sqliteInstance.run(query, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  update(entity: Partial<TEntity>, transaction?: Trasnaction): Promise<void> {
    const entityClass = this.entityModel;
    return new Promise((resolve, reject) => {
      const query = QueryBuilder.updateSql(entity as TEntity, this.entityModel);

      if (transaction) {
        transaction.addQuery(query);
        resolve();
        return;
      }

      this.db.sqliteInstance.run(query, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  delete(deletes: Partial<TEntity>, transaction?: Trasnaction): Promise<void> {
    const entityClass = this.entityModel;
    return new Promise((resolve, reject) => {
      const pk = MetadataExtractor.getEntityPrimaryKey(new entityClass());
      const id = (deletes as any)[pk.propertyKey];
      const query = `DELETE FROM ${this.tableName} WHERE ${pk.columnName} = '${id}'`;

      if (transaction) {
        transaction.addQuery(query);
        resolve();
        return;
      }

      this.db.sqliteInstance.run(query, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  getPragma(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `PRAGMA table_info(${this.tableName})`;

      this.db.sqliteInstance.all(query, (error: any, rows: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });
  }
}
