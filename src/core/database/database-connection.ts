
export abstract class DatabaseConnection {

  constructor(connectionString: string) { }

  abstract get dbInstance(): any;
  
  public abstract executeQuery(query: string, values: any[]): Promise<any[]>;
  public abstract executeNonQuery(query: string, values: any[]): Promise<void>;
}