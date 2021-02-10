export interface CkanResource {
    id: string;
    type: DatasetType | undefined;
}

export interface Dataset {
    title: string;
    description: string;
    resource: CkanResource;
    url: string;
}

export enum DatasetType {
    WMS = 'WMS',
    GEOJSON = 'GEOJSON',
    FIWARE = 'FIWARE'
}

export interface KeyValuePair {
    key: string;
    value: string;
}

export function parseDatasetType(str: string): DatasetType | undefined {
    if (str) {
        str = str.toUpperCase();
        return (DatasetType as any)[str];
    }
    return undefined;
}
