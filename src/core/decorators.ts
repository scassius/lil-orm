import {
  COLUMN_METADATA_KEY,
  ENTITY_METADATA_KEY,
  PRIMARY_KEY_METADATA_KEY,
} from "./constants";
import { LilORMType } from "./types";

export interface ColumnOtps {
  name?: string;
  type: LilORMType;
  defaultValue?: any;
  notNull?: boolean;
}

export interface PrimaryKeyOpts {
  autoIncrement?: boolean;
}

export function Entity(tableName?: string): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(
      ENTITY_METADATA_KEY,
      { name: tableName || target.constructor.name },
      target
    );
  };
}

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

export function Column(opts: ColumnOtps): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      COLUMN_METADATA_KEY,
      { name: opts?.name, type: opts.type },
      target,
      propertyKey
    );
  };
}
