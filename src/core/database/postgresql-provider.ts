import { Pool, PoolClient } from "pg";
import { DatabaseConnection } from "./database-connection";

export class PostgreSQLProvider implements DatabaseConnection {
  private readonly connectionPool: Pool;
  private persistentClient: PoolClient | null = null;

  constructor(connectionString: string) {
    this.connectionPool = new Pool({ connectionString });
  }

  get dbInstance() {
    return this.connectionPool;
  }

  private async getClient(): Promise<PoolClient> {
    if (!this.persistentClient) {
      this.persistentClient = await this.connectionPool.connect();
    }
    return this.persistentClient;
  }

  public async executeQuery(query: string, values: any[] = []): Promise<any[]> {
    const client = await this.getClient();
    try {
      const res = await client.query(query, values);
      return res.rows;
    } catch (error) {
      throw error;
    }
  }

  public async executeNonQuery(query: string, values: any[] = []): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query(query, values);
    } catch (error) {
      throw error;
    }
  }

  public async releaseConnection(): Promise<void> {
    if (this.persistentClient) {
      await this.persistentClient.release();
      this.persistentClient = null;
    }
  }
}
