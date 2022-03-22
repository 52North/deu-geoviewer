export interface CkanResource {
    id: string;
    type: DatasetType | undefined;
}

export interface LangTitle {
    code: string;
    title: string;
}

export type TitleInput = string | LangTitle[];

export interface Dataset {
    title: TitleInput;
    description: string;
    resource: CkanResource;
    primaryUrl: string;
    secondaryUrl?: string;
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
