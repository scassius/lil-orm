import { SQLiteDatabase } from "./sqlite-database";

export class Transaction {
  private statements: string[];
  /**
   * Creates an instance of Transaction.
   * @param {SQLiteDatabase} db - The database instance.
   */
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Begins the transaction.
   */
  begin(): void {
    this.statements = [];
    this.db.sqliteInstance.exec("BEGIN");
  }

  /**
   * Commits the transaction.
   */
  commit(): void {
    this.db.sqliteInstance.exec("COMMIT");
  }

  /**
   * Adds a query to the transaction.
   * @param {string} query - The query to be added.
   */
  addQuery(query: string): void {
    this.statements.push(query);
  }

  /**
   * Rolls back the transaction.
   */
  rollback(): void {
    this.db.sqliteInstance.exec("ROLLBACK");
  }

  /**
   * Executes a transactional callback function.
   * @template T - The type of the result returned by the callback.
   * @param {function} callback - The transactional callback function.
   * @returns {Promise<T>} A promise that resolves to the result of the callback.
   * @throws {Error} If an error occurs during the transaction or query execution.
   */
  async transaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    this.begin();
    try {
      const result = await callback(this);
      await this.executeStatements();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  /**
   * Executes the statements in the transaction.
   * @private
   * @returns {Promise<void>} A promise that resolves when all statements have been executed successfully.
   * @throws {Error} If an error occurs during the execution of the statements.
   */
  private executeStatements(): Promise<void> {
    const statements = this.statements.join(";");
    return new Promise((resolve, reject) => {
      this.db.sqliteInstance.exec(statements, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
