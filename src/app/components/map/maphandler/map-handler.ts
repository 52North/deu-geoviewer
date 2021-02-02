import { Map, Overlay } from 'ol';
import { Extent } from 'ol/extent';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import { PROJECTIONS as EPSG_3857 } from 'ol/proj/epsg3857';
import { PROJECTIONS as EPSG_4326 } from 'ol/proj/epsg4326';
import Projection from 'ol/proj/Projection';
import { OSM, TileArcGISRest } from 'ol/source';

import { ConfigurationService } from './../../../configuration/configuration.service';
import { LegendEntry, MapProjection } from './model';

export abstract class MapHandler {

    protected map!: Map;

    protected overlay?: Overlay;

    protected legendEntries: LegendEntry[] = [];

    constructor(
        protected config: ConfigurationService
    ) {
        this.createPopup();
    }

    public abstract createMap(mapId: string): void;

    public abstract activateFeatureInfo(): void;

    public abstract deactivateFeatureInfo(): void;

    public getLegendEntries(): LegendEntry[] {
        return this.legendEntries;
    }

    public closePopup(): void {
        if (this.overlay) {
            this.overlay.setPosition(undefined);
        }
    }

    public zoomIn(): void {
        if (this.map && typeof this.map.getView().getZoom() === 'number') {
            const currZoom = this.map.getView().getZoom() as number;
            if (currZoom + 1 <= this.map.getView().getMaxZoom()) {
                this.map.getView().animate({
                    zoom: this.map.getView().getZoom() as number + 1,
                    duration: 250
                });
            }
        }
    }

    public zoomOut(): void {
        if (this.map && typeof this.map.getView().getZoom() === 'number') {
            const currZoom = this.map.getView().getZoom() as number;
            if (currZoom - 1 >= this.map.getView().getMinZoom()) {
                this.map.getView().animate({
                    zoom: this.map.getView().getZoom() as number - 1,
                    duration: 250
                });
            }
        }
    }

    public zoomToExtent(extent: Extent): void {
        this.map.getView().fit(extent);
    }

    protected createBaseLayers(projection: Projection): Layer[] {
        const layers: Layer[] = [];
        const crsCode = this.findMapProjection(projection);
        const layerConfs = this.config.configuration.baseLayer.filter(e => !e.crs || e.crs === crsCode);
        layerConfs.forEach(lc => {
            switch (lc.type) {
                case 'OSM':
                    layers.push(new TileLayer({
                        source: new OSM(),
                        maxZoom: lc.maxZoom,
                        minZoom: lc.minZoom
                    }));
                    break;
                case 'TileArcGIS':
                    layers.push(new TileLayer({
                        source: new TileArcGISRest({ url: lc.url }),
                        maxZoom: lc.maxZoom,
                        minZoom: lc.minZoom
                    }));
                    break;
            }
        });
        return layers;
    }

    protected getDefaultExtent(projection: Projection): Extent {
        const defExtent = this.config.configuration.defaultMapExtent.find(e => e.crs === projection.getCode());
        if (defExtent) {
            return defExtent.extent;
        } else {
            throw new Error(`No default extent configured for ${projection.getCode()}`);
        }
    }

    private createPopup(): void {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.style.display = 'unset';
            this.overlay = new Overlay({
                element: popup,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250,
                },
            });
        }
    }

    private findMapProjection(projection: Projection): string {
        const code = projection.getCode();
        if (EPSG_3857.find(e => e.getCode() === code)) {
            return MapProjection.EPSG_3857;
        }
        if (EPSG_4326.find(e => e.getCode() === code)) {
            return MapProjection.EPSG_4326;
        }
        return code;
    }

}
