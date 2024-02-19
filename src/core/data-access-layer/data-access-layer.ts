import { DatabaseConnection } from "../database/database-connection";
import {
  QueryBuilderAPI,
} from "../query-builders/api-query-language";

export class DataAccessLayer {
  private database: DatabaseConnection;

  constructor(database: DatabaseConnection) {
    this.database = database;
  }

  public async retrieve<T>(
    queryBuilder: QueryBuilderAPI,
    entityMapper: (data: any) => T
  ): Promise<T[]> {
    const query = queryBuilder.build();
    console.log(query.query)
    const queryResult = await this.database.executeQuery(query.query, query.values);
    return queryResult.map(entityMapper);
  }

  public async insert(queryBuilders: QueryBuilderAPI | QueryBuilderAPI[]): Promise<void> {
    const queries = Array.isArray(queryBuilders) ? queryBuilders : [queryBuilders];
    const queryStr: string[] = [];
    const values: any[] = [];
    queries.forEach((queryBuilder) => {
      const query = queryBuilder.build();
      queryStr.push(query.query);
      values.push(...query.values);
    })
    
    await this.database.executeNonQuery(queryStr.join(';'), values);
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
