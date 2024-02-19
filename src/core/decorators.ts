import {
  COLUMN_METADATA_KEY,
  ENTITY_METADATA_KEY,
  FOREIGN_KEYS_METADATA_KEY,
  ON_INSERT_METADATA_KEY,
  ON_UPDATE_METADATA_KEY,
  PRIMARY_KEY_METADATA_KEY,
} from "./metadata/constants";
import { LilORMType } from "./type-maps/lil-orm-types";

/**
 * @interface ColumnOpts
 * @description Options for defining a column in the entity.
 * @property {string} [name] - The name of the column (optional).
 * @property {LilORMType} type - The data type of the column.
 * @property {*} [defaultValue] - The default value for the column.
 * @property {boolean} [nullable] - Indicates if the column is nullable.
 */
export interface ColumnOpts {
  name?: string;
  type: LilORMType;
  defaultValue?: any;
  nullable?: boolean;
}

interface ForeignKeyOptions {
  referencedEntity: () => Function;
  referencedColumnName: string;
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
 * @param {ColumnOpts} opts - Options for the column.
 */
export function Column(opts: ColumnOpts): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      COLUMN_METADATA_KEY,
      { name: opts?.name, type: opts.type, nullable: opts?.nullable },
      target,
      propertyKey
    );
  };
}

export function OnInsert(generateFunction: () => any): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata(ON_INSERT_METADATA_KEY, target.constructor)) {
      Reflect.defineMetadata(ON_INSERT_METADATA_KEY, new Map(), target.constructor);
    }
    const onInsertMetadata = Reflect.getMetadata(ON_INSERT_METADATA_KEY, target.constructor);
    onInsertMetadata.set(propertyKey, generateFunction);
  };
}

export function OnUpdate(generateFunction: () => any): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    if (!Reflect.hasMetadata(ON_UPDATE_METADATA_KEY, target.constructor)) {
      Reflect.defineMetadata(ON_UPDATE_METADATA_KEY, new Map(), target.constructor);
    }
    const onUpdateMetadata = Reflect.getMetadata(ON_UPDATE_METADATA_KEY, target.constructor);
    onUpdateMetadata.set(propertyKey, generateFunction);
  };
}

export function ForeignKey(options: ForeignKeyOptions): PropertyDecorator {
  return function(target: any, propertyKey: string | symbol) {
    const existingKeys = Reflect.getMetadata(FOREIGN_KEYS_METADATA_KEY, target.constructor) || [];
    const newKey = { propertyKey, ...options };
    Reflect.defineMetadata(FOREIGN_KEYS_METADATA_KEY, [...existingKeys, newKey], target.constructor);
  };
}