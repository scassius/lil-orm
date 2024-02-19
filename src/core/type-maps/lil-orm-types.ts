export type DBSMType = 'postgresql' | 'sqlite';

export type EntityType<T> = new () => T extends object ? T : any;

export interface LilORMModuleOptions {
    database: string;
    entities: any[];
}

export interface ColumnMetadata {
    name: string;
    type: LilORMType;
    value: string | number;
}

type TypeScriptType =
    | "number"
    | "string"
    | "boolean"
    | "Date"
    | "Array<any>"
    | "Buffer"
    | "any";

export type LilORMType =
    | "integer"
    | "text"
    | "real"
    | "blob"
    | "json"
    | "boolean"
    | "date"
    | "uuid"
    | "timestamp"
    | "decimal"
    | "float"
    | "double"
    | "time"
    | "char"
    | "varchar"
    | "enum"
    | "array"
    | "binary"
    | "bit"
    | "money";


const lilORMToTypeScript: { [key in LilORMType]: TypeScriptType } = {
    integer: "number",
    text: "string",
    real: "number",
    blob: "Buffer",
    json: "any",
    boolean: "boolean",
    date: "Date",
    uuid: "string",
    timestamp: "Date",
    decimal: "number",
    float: "number",
    double: "number",
    time: "string",
    char: "string",
    varchar: "string",
    enum: "any",
    array: "Array<any>",
    binary: "Buffer",
    bit: "number",
    money: "number",
};