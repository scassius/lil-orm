import { DBSMType } from "../types";
import { DatabaseConnection } from "./database-connection";
import { PostgreSQLProvider } from "./postgresql-provider";
import { SQLiteProvider } from "./sqlite-provider";

export class DatabaseConnectionFactory {
  public static createConnection(
    type: DBSMType,
    connectionString: string
  ): DatabaseConnection {
    switch (type) {
      case 'postgresql':
        return new PostgreSQLProvider(connectionString);
      case 'sqlite':
        return new SQLiteProvider(connectionString);
      default:
        throw new Error("Unsupported database type");
    }
  }
}