import * as sqlite3 from "sqlite3";
import { EntityTransformer } from "../entity-transformer";
import { EntityType } from "../types";

export interface Result<T> {
  rows: T[];
  count: number;
}

export class SQLiteDatabase {
  private db: sqlite3.Database;

  constructor(database: string) {
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

  query(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve([...rows]);
        }
      });
    });
  }
}
