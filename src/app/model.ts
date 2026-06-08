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
  WMS,
  GEOJSON,
  FIWARE,
  OGCAPIFEATURES,
}

export interface KeyValuePair {
  key: string;
  value: string;
}

const datasetTypeAliases: Record<string, DatasetType> = {
  WMS: DatasetType.WMS,
  GEOJSON: DatasetType.GEOJSON,
  FIWARE: DatasetType.FIWARE,
  OGCAPIFEATURES: DatasetType.OGCAPIFEATURES,
  'OGC API FEATURES': DatasetType.OGCAPIFEATURES,
  OGCFEAT: DatasetType.OGCAPIFEATURES,
};

export function parseDatasetType(str: string): DatasetType | undefined {
  if (str) {
    return datasetTypeAliases[str.toUpperCase()] ?? datasetTypeAliases[str];
  }
  return undefined;
}
