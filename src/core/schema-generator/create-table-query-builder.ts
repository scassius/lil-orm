export abstract class CreateTableQueryBuilder {
  public abstract createTableSql(entityClass: any): string;
}
