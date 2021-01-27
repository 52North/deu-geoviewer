import { Extent } from 'ol/extent';

export type Configuration = {
    proxyUrl: string;
    apiUrl: string;
    defaultMapExtent: {
        crs: string;
        extent: Extent;
    }[];
    baseLayer: {
        crs?: string;
        type: 'OSM' | 'TileArcGIS';
        url?: string;
        minZoom?: number;
        maxZoom?: number;
    }[];
    languages: LanguageConfig[]
};

export interface LanguageConfig {
    code: string;
    label: string;
}
