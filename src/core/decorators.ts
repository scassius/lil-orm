import {
  COLUMN_METADATA_KEY,
  ENTITY_METADATA_KEY,
  PRIMARY_KEY_METADATA_KEY,
} from "./metadata/constants";
import { LilORMType } from "./types";

/**
 * @interface ColumnOtps
 * @description Options for defining a column in the entity.
 * @property {string} [name] - The name of the column.
 * @property {LilORMType} type - The data type of the column.
 * @property {*} [defaultValue] - The default value for the column.
 * @property {boolean} [notNull] - Indicates if the column is not nullable.
 */
export interface ColumnOtps {
  name?: string;
  type: LilORMType;
  defaultValue?: any;
  notNull?: boolean;
}

/**
 * @interface PrimaryKeyOpts
 * @description Options for defining a primary key in the entity.
 * @property {boolean} [autoIncrement] - Indicates if the primary key should auto-increment.
 */
export interface PrimaryKeyOpts {
  autoIncrement?: boolean;
}

/**
 * @function Entity
 * @description Decorator function to define an entity.
 * @param {string} [tableName] - The name of the table associated with the entity.
 */
export function Entity(tableName?: string): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(
      ENTITY_METADATA_KEY,
      { name: tableName || target.constructor.name },
      target
    );
  };
}

/**
 * @function PrimaryKey
 * @description Decorator function to define a primary key.
 * @param {PrimaryKeyOpts} [opts] - Options for the primary key.
 */
export function PrimaryKey(opts?: PrimaryKeyOpts): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      PRIMARY_KEY_METADATA_KEY,
      { ...opts },
      target,
      propertyKey
    );
  };
}

/**
 * @function Column
 * @description Decorator function to define a column.
 * @param {ColumnOtps} opts - Options for the column.
 */
export function Column(opts: ColumnOtps): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      COLUMN_METADATA_KEY,
      { name: opts?.name, type: opts.type, notNull: opts?.notNull },
      target,
      propertyKey
    );
  };
}
