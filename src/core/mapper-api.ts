import { EntityTransformer } from "./entity-transformer";

export class MapperAPI {

    constructor() { }

    /**
     * This function converts raw SQL entity data into an instance of a given entity class. 
     * It uses metadata (from decorators) associated with the entity class to correctly serialize the values (e.g., string to JSON).
     *
     * @template TEntity The type of the entity class to which the raw SQL entity data should be mapped.
     * @param {new () => TEntity extends object ? TEntity : any} entityclass The constructor of the entity class class.
     * @param {any} data The raw SQL entity data to be serialized and mapped to an instance of the TEntity class.
     * @returns {TEntity} Returns a JavaScript object that is an instance of TEntity with its properties filled and serialized according to the entity metadata and the corresponding values from the data parameter.
     */
    sqlEntityToObj<TEntity>(
        entityClass: new () => TEntity extends object
            ? TEntity
            : any,
        data: any
    ): TEntity {
        return EntityTransformer.sqlEntityToObj(new entityClass(), data);
    }
}