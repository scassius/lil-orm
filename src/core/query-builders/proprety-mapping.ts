import { MetadataExtractor } from "../metadata/metadata-extractor";
import { LilORMType } from "../type-maps/lil-orm-types";

export interface PropertyMapping<T> {
  entityProperty: string;
  columnName: string;
  columnType: LilORMType;
}

export function getPropertyMappings<T>(
  entityClass: new () => T extends object ? T : any
): PropertyMapping<T>[] {
  const propertyMappings: PropertyMapping<T>[] = [];

  for (const propertyName of Object.keys(new entityClass())) {
    const columnMetadata = MetadataExtractor.getColumnMetadata(
      new entityClass(),
      propertyName
    );

    if (columnMetadata) {
      const columnName = columnMetadata.name || propertyName;
      const columnType = columnMetadata?.type;
      propertyMappings.push({
        entityProperty: propertyName,
        columnName,
        columnType,
      });
    }
  }

  return propertyMappings;
}