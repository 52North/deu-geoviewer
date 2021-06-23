import { Extent } from 'ol/extent';

export type Configuration = {
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
        attributions?: string | string[]
    }[];
    languages: LanguageConfig[];
    supportTicketPrefix: string;
};

export interface LanguageConfig {
    code: string;
    label: string;
}
