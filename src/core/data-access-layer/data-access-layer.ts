import { DatabaseConnection } from "../database/database-connection";
import { QueryBuilderAPI } from "../query-builders/api-query-language";

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
    const queryResult = await this.database.executeQuery(query);
    return queryResult.map(entityMapper);
  }

  public async insert(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query);
  }

  public async update(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query);
  }

  public async delete(queryBuilder: QueryBuilderAPI): Promise<void> {
    const query = queryBuilder.build();
    await this.database.executeNonQuery(query);
  }
}
