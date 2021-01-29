export interface Dataset {
    title: string;
    description: string;
    id: string;
    url: string;
    type: DatasetType;
}

export enum DatasetType {
    WMS = 'WMS',
    GEOJSON = 'GEOJSON'
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
