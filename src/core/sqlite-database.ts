import * as sqlite3 from 'sqlite3';
import { EntityTransformer } from './entity-transformer';
import { EntityType } from './types';

export interface Result<T> {
  rows: T[];
  count: number;
}

export class SQLiteDatabase {
  private db: sqlite3.Database;

  constructor(private readonly database: string) {
    this.db = new sqlite3.Database(database);
  }

  get sqliteInstance(): sqlite3.Database {
    return this.db;
  }

  run(query: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  query<T>(query: string, entityClass?: EntityType<T>): Promise<Result<T>> {
    return new Promise((resolve, reject) => {
      this.db.all(query, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            rows: entityClass
              ? rows.map((row) => {
                  return EntityTransformer.transformSQLEntityToObject(new entityClass(), row);
                })
              : rows.map((row) => {
                  return row as T;
                }),
            count: rows.length,
          });
        }
      });
    });
  }
}
