import { QueryBuilder } from './query-builder';
import { Repository } from './repository';
import { SQLiteDatabase } from './sqlite-database';

export interface LilORMModuleOptions {
  database: string;
  entities: any[];
}

export class LilORMModule {
  private readonly database: SQLiteDatabase;
  constructor(private readonly options: LilORMModuleOptions) {
    this.database = new SQLiteDatabase(options.database);
  }

  async migrate() {
    for (const entity of this.options.entities) {
      await this.migrateEntity(entity);
    }
  }

  async migrateEntity<T>(entity: T) {
    const createTableQuery = QueryBuilder.createTableSql(entity);
    await this.database.run(createTableQuery);
  }

  async tableExists(tableName: string): Promise<boolean> {
    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    const res = await this.database.query<{ name: string }>(query);
    return res.count > 0;
  }

  getRepository<TEntity>(entity: new () => TEntity extends object ? TEntity : any) {
    return new Repository<TEntity>(entity, this.database);
  }

  static forRoot(options: LilORMModuleOptions) {
    return {
      module: LilORMModule,
      providers: [
        {
          provide: 'LilORMModuleOptions',
          useValue: options,
        },
      ],
    };
  }
}

export function createModule(options: LilORMModuleOptions): LilORMModule {
  return new LilORMModule(options);
}
