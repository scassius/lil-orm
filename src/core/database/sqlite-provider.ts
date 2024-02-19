import * as sqlite3 from "sqlite3";
import { DatabaseConnection } from "./database-connection";

export interface Result<T> {
  rows: T[];
  count: number;
}

export class SQLiteProvider implements DatabaseConnection {
  private db: sqlite3.Database;

  constructor(connectionString: string) {
    this.db = new sqlite3.Database(connectionString);
  }

  get dbInstance(): sqlite3.Database {
    return this.db;
  }

  executeNonQuery(query: string, values: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, values, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  executeQuery(query: string, values: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, values, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve([...rows]);
        }
      });
    });
  }
}
