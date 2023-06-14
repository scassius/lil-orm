import { MetadataExtractor } from "../metadata";

export interface PropertyMapping<T> {
    entityProperty: string;
    columnName: string;
}

export function getPropertyMappings<T>(entityClass: new () => T extends object ? T : any): PropertyMapping<T>[] {
    const propertyMappings: PropertyMapping<T>[] = [];

    for (const propertyName of Object.keys(new entityClass())) {
        const columnMetadata = MetadataExtractor.getColumnMetadata(new entityClass(), propertyName);

        if (columnMetadata) {
            const columnName = columnMetadata.name || propertyName;
            propertyMappings.push({ entityProperty: propertyName, columnName });
        }
    }

    return propertyMappings;
}