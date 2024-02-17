import { Pool } from "pg";
import { DBSMType } from "../types";

export class DatabaseConnection {
  private readonly connection: Pool;

  constructor(
    connectionString: string,
    private readonly driver: DBSMType
  ) {
    this.connection = new Pool({
      connectionString,
    });
  }

  get postgresDbInstance() {
    return this.connection;
  }

  public async executeQuery(query: string, values: any[]): Promise<any[]> {
    const client = await this.connection.connect();
    try {
      const res = await client.query(query);
      return res.rows;
    } finally {
      client.release();
    }
  }

  public async executeNonQuery(query: string, values: any[]): Promise<void> {
    const client = await this.connection.connect();
    try {
      await client.query(query);
    } finally {
      client.release();
    }
  }
}
