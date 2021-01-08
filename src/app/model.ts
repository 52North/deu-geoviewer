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
