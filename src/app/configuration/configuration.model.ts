import { Extent } from 'ol/extent';

export type Configuration = {
    apiUrl: string;
    defaultMapExtent: {
        crs: string;
        extent: Extent;
    }[];
    baseLayer: {
        crs?: string;
        type: 'TileArcGIS' | 'WMTS';
        url?: string;
        options?: any;
        minZoom?: number;
        maxZoom?: number;
    }[];
    languages: LanguageConfig[];
    supportTicketPrefix: string;
};

export interface LanguageConfig {
    code: string;
    label: string;
}
