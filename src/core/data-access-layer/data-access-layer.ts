import { DatabaseConnection } from "../database/database-connection";
import { QueryBuilderAPI } from "../query-builders/api-query-language";

export class DataAccessLayer {
  private database: DatabaseConnection;

  constructor(database: DatabaseConnection) {
    this.database = database;
  }

  public async retrieve<T>(queryBuilder: QueryBuilderAPI, entityMapper: (data: any) => T): Promise<T[]> {
    const query = queryBuilder.build();
    console.log('retrive', query)
    const queryResult = await this.database.executeQuery(query);
    return queryResult.map(entityMapper);
  }

  public async insert<T>(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query);
  }

  public async update<T>(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    console.log(query)
    await this.database.executeNonQuery(query);
  }

  public async delete<T>(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query);
  }
}