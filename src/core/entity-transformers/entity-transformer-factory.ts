import { DBSMType } from "../types";
import { EntityTransformer } from "./entity-transformer";
import { PostgreSQLEntityTransformer } from "./posgtresql-entity-transformer";

export class EntityTransformerFactory {
    
    static create(dbsmType: DBSMType): EntityTransformer {
        switch (dbsmType) {
            case 'postgresql':
                return new PostgreSQLEntityTransformer();
            case 'sqlite':
                //return new SQLiteBuilder();
            default:
                throw new Error(`Unsupported DBMS Type: ${dbsmType}`);
        }
    }
}