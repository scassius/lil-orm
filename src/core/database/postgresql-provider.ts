import { Pool } from "pg";
import { DatabaseConnection } from "./database-connection";

export class PostgreSQLProvider implements DatabaseConnection {
  private readonly connection: Pool;

  constructor(
    connectionString: string
  ) {
    this.connection = new Pool({
      connectionString,
    });
  }

  get dbInstance() {
    return this.connection;
  }

  public async executeQuery(query: string, values: any[]): Promise<any[]> {
    const client = await this.connection.connect();
    try {
      const res = await client.query(query, values);
      return res.rows;
    } finally {
      client.release();
    }
  }

  public async executeNonQuery(query: string, values: any[]): Promise<void> {
    const client = await this.connection.connect();
    try {
      await client.query(query, values);
    } finally {
      client.release();
    }
  }
}
