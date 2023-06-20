import { MetadataExtractor } from "../metadata/metadata-extractor";
import { QueryBuilderAPI, OperationType } from "./api-query-language";
import { valueQueryFormatter } from "./proprety-mapping";
import { QueryCondition, WhereQueryBuilder } from "./where-query-builder";

export class UpdateQueryBuilder<T> {

    constructor(
        private readonly entityClass: new () => T extends object ? T : any,
        private readonly queryBuilder: QueryBuilderAPI
    ) {
        this.queryBuilder.forEntity(this.entityClass, OperationType.Update);
    }

    finalize(): QueryBuilderAPI {
        return this.queryBuilder;
    }

    setObject(object: Partial<T>): UpdateQueryBuilder<T> {
        const entityInstance = Object.assign(new this.entityClass(), object);
        const values = MetadataExtractor.getEntityValues(entityInstance)
        const columns: any[] = MetadataExtractor.getEntityColumnsName(entityInstance)
    
        let setClause: any[] = [];
        
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== undefined && !Number.isNaN(values[i])) {
                setClause.push(`${columns[i]} = ${valueQueryFormatter(values[i])}`)
            }
        }
    
        this.queryBuilder.setSetClauses(setClause);

        return this;
    }

    where<K extends keyof T & string>(propertySelector: K): QueryCondition<T, keyof T & string> {
        const whereQueryBuilder = new WhereQueryBuilder<T>(this.entityClass, this.queryBuilder);
        const queryCondition = whereQueryBuilder.where(propertySelector);
        return queryCondition;
    }
}