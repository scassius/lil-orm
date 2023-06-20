import { SQLiteDatabase } from "./sqlite-provider";

export type DatabaseDriver = "sqlite";

export class DatabaseConnection {
  private readonly connection: SQLiteDatabase;

  constructor(
    connectionString: string,
    private readonly driver: DatabaseDriver
  ) {
    this.connection = new SQLiteDatabase(connectionString);
  }

  get sqliteDbInstance() {
    return this.connection;
  }

  public async executeQuery(query: string): Promise<any[]> {
    const result = await this.connection.query(query);
    return result;
  }

  public async executeNonQuery(query: string): Promise<void> {
    await this.connection.run(query);
  }
}
