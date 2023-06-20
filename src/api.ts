import { Repository } from "./core";
import { DatabaseConnection } from "./core/database/database-connection";
import { CreateTableQueryBuilder } from "./core/query-builders/create-table-query-builder";

/**
 * TODO:
 * SQL Injection
 * Multiple entities select
 * Joins
 * Nestes where
 */

export class LilORM {
  private readonly databaseConnection: DatabaseConnection;

  /**
   * Creates an instance of LilORM.
   * @param {string} databaseString - The connection string or file path of the SQLite database.
   */
  constructor(private readonly databaseString: string) {
    this.databaseConnection = new DatabaseConnection(this.databaseString, 'sqlite');
  }

  /**
   * Creates a table for the specified entity in the SQLite database.
   * @param {object} entityClass - The class representing the entity.
   * @returns {Promise<void>} A Promise that resolves when the table is created.
   */
  async createTable<TEntity>(entityClass: TEntity): Promise<void> {
    const createTableQuery = CreateTableQueryBuilder.createTableSql(entityClass);
    await this.databaseConnection.executeNonQuery(createTableQuery);
  }

  /**
   * Retrieves a repository for the specified entity.
   * @param {Function} entityClass - The class representing the entity.
   * @returns {Repository<TEntity>} A repository instance for the entity.
   */
  getRepository<TEntity>(
    entityClass: new () => TEntity extends object ? TEntity : any
  ): Repository<TEntity> {
    return new Repository<TEntity>(entityClass, this.databaseConnection);
  }

  /**
   * Checks if a table with the specified name exists in the SQLite database.
   * @param {string} tableName - The name of the table to check.
   * @returns {Promise<boolean>} A Promise that resolves to true if the table exists, false otherwise.
   */
  async tableExists(tableName: string): Promise<boolean> {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    const res = await this.databaseConnection.executeQuery(query);
    return res.length > 0;
  }

  get dbInstance() {
    return this.databaseConnection;
  }
}
