import { LilORMType } from "../types";

export abstract class EntityTransformer {
    
    sqlEntityToObj<TEntity>(entityInstance: any, values: any): TEntity {
      throw new Error("Method not implemented.");
    }
  
    valueQueryFormatter(value: any): string {
      throw new Error("Method not implemented.");
    }
  
    formatValue(value: any, type: LilORMType): any {
      throw new Error("Method not implemented.");
    }
  
    formatValueToPostgreSQLType(value: any, type: LilORMType): any {
      throw new Error("Method not implemented.");
    }
  }
  