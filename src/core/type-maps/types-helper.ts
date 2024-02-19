export class TypesHelper {
  static isJSONObject(value: any): boolean {
    return typeof value === "object";
  }

  static isDate(value: any): boolean {
    return value instanceof Date;
  }

  static isString(value: any): boolean {
    return typeof value === "string";
  }

  static isNumber(value: any): boolean {
    return typeof value === "number";
  }

  static isBoolean(value: any): boolean {
    return typeof value === "boolean";
  }

  static isUUID(value: any): boolean {
    const regex = new RegExp(
      "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    );
    return regex.test(value);
  }

  static parseInteger(value: any): number {
    return parseInt(value, 10);
  }

  static parseString(value: any): string {
    return value.toString();
  }

  static parseBoolean(value: any): boolean {
    return value === "true" || value === "1" || value === 1;
  }

  static parseReal(value: any): number {
    return parseFloat(value);
  }

  static parseJson(value: any): any {
    return JSON.parse(value);
  }

  static parseDate(value: any): Date {
    return new Date(value);
  }

  /* tslint:disable:no-bitwise */
  static generateUUIDv4(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  /* tslint:disable:no-bitwise */
}
