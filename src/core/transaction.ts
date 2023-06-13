import { SQLiteDatabase } from './sqlite-database';

export class Transaction {
  private statemanets: string[];

  constructor(private readonly db: SQLiteDatabase) {}

  begin(): this {
    this.statemanets = [];
    this.statemanets.push('BEGIN TRANSACTION');
    return this;
  }

  commit(): void {
    this.statemanets.push('COMMIT');
    this.db.sqliteInstance.exec(this.statemanets.join(';'));
  }

  addQuery(query: string) {
    this.statemanets.push(query);
  }

  rollback(): void {
    this.statemanets.push('ROLLBACK');
    this.db.sqliteInstance.exec(this.statemanets.join(';'));
  }

  transaction<T>(callback: (transaction: Transaction) => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.begin();
      try {
        const result = await callback(this);
        this.commit();
        resolve(result);
      } catch (error) {
        this.rollback();
        reject(error);
      }
    });
  }
}
