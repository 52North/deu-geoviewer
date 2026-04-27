import { Extent } from 'ol/extent';

export interface Configuration {
  defaultMapExtent: {
    crs: string;
    extent: Extent;
  }[];
  baseLayer: {
    crs?: string;
    type: 'TileArcGIS' | 'WMTS';
    url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any;
    minZoom?: number;
    maxZoom?: number;
    attributions?: string | string[];
  }[];
  languages: LanguageConfig[];
  supportTicketPrefix: string;
}

export interface LanguageConfig {
  code: string;
  label: string;
}
