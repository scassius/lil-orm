import { Repository } from "./core";
import { QueryBuilder } from "./core/query-builder";
import { SQLiteDatabase } from "./core/sqlite-database";

export class LilORM {
  private readonly sqliteDatabase: SQLiteDatabase;

  /**
   * Creates an instance of LilORM.
   * @param {string} databaseString - The connection string or file path of the SQLite database.
   */
  constructor(private readonly databaseString: string) {
    this.sqliteDatabase = new SQLiteDatabase(this.databaseString);
  }

  /**
   * Creates a table for the specified entity in the SQLite database.
   * @param {object} entityClass - The class representing the entity.
   * @returns {Promise<void>} A Promise that resolves when the table is created.
   */
  async createTable<TEntity>(entityClass: TEntity): Promise<void> {
    const createTableQuery = QueryBuilder.createTableSql(entityClass);
    await this.sqliteDatabase.run(createTableQuery);
  }

  /**
   * Retrieves a repository for the specified entity.
   * @param {Function} entityClass - The class representing the entity.
   * @returns {Repository<TEntity>} A repository instance for the entity.
   */
  getRepository<TEntity>(
    entityClass: new () => TEntity extends object ? TEntity : any
  ): Repository<TEntity> {
    return new Repository<TEntity>(entityClass, this.sqliteDatabase);
  }

  /**
   * Checks if a table with the specified name exists in the SQLite database.
   * @param {string} tableName - The name of the table to check.
   * @returns {Promise<boolean>} A Promise that resolves to true if the table exists, false otherwise.
   */
  async tableExists(tableName: string): Promise<boolean> {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    const res = await this.sqliteDatabase.query<{ name: string }>(query);
    return res.count > 0;
  }

  get dbInstance() {
    return this.sqliteDatabase;
  }
}
