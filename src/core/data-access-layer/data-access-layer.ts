import { DatabaseConnection } from "../database/database-connection";
import { QueryBuilderAPI } from "../query-builders/api-query-language";
import { Transaction } from "./transaction";

export class DataAccessLayer {
  private database: DatabaseConnection;

  constructor(
    private readonly transaction: Transaction,
    database: DatabaseConnection
  ) {
    this.database = database;
  }

  public async retrieve<T>(
    queryBuilder: QueryBuilderAPI,
    entityMapper: (data: any) => T
  ): Promise<T[]> {
    const query = queryBuilder.build();
    const queryResult = await this.database.executeQuery(
      query.query,
      query.values
    );

    return queryResult.map(entityMapper);
  }

  public async insert(
    queryBuilders: QueryBuilderAPI | QueryBuilderAPI[],
    parallel: boolean = false
  ): Promise<void> {
    const queries = Array.isArray(queryBuilders)
      ? queryBuilders
      : [queryBuilders];

    if (parallel) {
      const operations = queries.map(async (queryBuilder) => {
        const { query, values } = queryBuilder.build();
        return this.database.executeNonQuery(query, values);
      });
      await Promise.all(operations);
    } else if (queries.length === 1) {
      const { query, values } = queries[0].build();
      await this.database.executeNonQuery(query, values);
    } else {
      await this.transaction.begin();
      try {
        for (const queryBuilder of queries) {
          const { query, values } = queryBuilder.build();
          await this.database.executeNonQuery(query, values);
        }
        await this.transaction.commit();
      } catch (error) {
        await this.transaction.rollback();
        throw error;
      }
    }
  }

  public async update(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query.query, query.values);
  }

  public async delete(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query.query, query.values);
  }
}
