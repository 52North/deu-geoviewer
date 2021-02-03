import { Extent } from 'ol/extent';
import Layer from 'ol/layer/Layer';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

import { WMSLayer } from '../../../services/wms.service';

proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

export enum MapProjection {
    EPSG_4326 = 'EPSG:4326',
    EPSG_3857 = 'EPSG:3857',
    EPSG_3035 = 'EPSG:3035',
}

export class MapOptions { }

export class GeoJSONOptions extends MapOptions {
    constructor(public geojson: any) {
        super();
    }
}

export class WmsOptions extends MapOptions {
    constructor(public layers: WMSLayer[]) {
        super();
    }
}

export class FiwareOptions extends MapOptions {
    constructor(public url: string) {
        super();
    }
}

export type LegendEntry = {
    title: string;
    abstract: string;
    extent?: Extent;
    layer: Layer;
};