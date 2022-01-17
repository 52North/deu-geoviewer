import { Map, Overlay } from 'ol';
import Attribution from 'ol/control/Attribution';
import Control from 'ol/control/Control';
import { Extent } from 'ol/extent';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import { PROJECTIONS as EPSG_3857 } from 'ol/proj/epsg3857';
import { PROJECTIONS as EPSG_4326 } from 'ol/proj/epsg4326';
import Projection from 'ol/proj/Projection';
import { TileArcGISRest, TileImage, WMTS } from 'ol/source';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { Observable, Subject } from 'rxjs';

import { ConfigurationService } from './../../../configuration/configuration.service';
import { LegendEntry, MapProjection } from './model';

export abstract class MapHandler {

    protected map!: Map;

    protected overlay?: Overlay;

    protected legendEntries: LegendEntry[] = [];

    public mapLoading: Subject<boolean> = new Subject<boolean>();

    constructor(
        protected config: ConfigurationService
    ) {
        this.createPopup();
    }

    public abstract createMap(mapId: string): Observable<void>;

    public abstract mapViewDestroyed(): void;

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

    protected createControls(): Control[] {
        return [
            new Attribution({
                collapseLabel:"«",
                collapsed: false,
                collapsible: false
            })
        ];
    }

    protected createBaseLayers(projection: Projection): TileLayer<TileImage>[] {
        const layers: TileLayer<TileImage>[] = [];
        const crsCode = this.findMapProjection(projection);
        const layerConfs = this.config.configuration.baseLayer.filter(e => !e.crs || e.crs === crsCode);
        layerConfs.forEach(lc => {
            switch (lc.type) {
                case 'WMTS':
                    const wmtsSource = new WMTS({
                        url: lc.url,
                        matrixSet: lc.options.matrixSet,
                        layer: '',
                        style: 'default',
                        requestEncoding: 'REST',
                        format: 'png',
                        tileGrid: new WMTSTileGrid({
                            origin: lc.options.topLeft,
                            resolutions: lc.options.resolutions,
                            matrixIds: lc.options.resolutions.map((e: number, i: number) => i.toString())
                        }),
                        attributions: lc.attributions
                    });
                    this.addloadingEvents(wmtsSource);
                    layers.push(new TileLayer({
                        source: wmtsSource,
                        maxZoom: lc.maxZoom,
                        minZoom: lc.minZoom
                    }));
                    break;
                case 'TileArcGIS':
                    const source = new TileArcGISRest({
                        url: lc.url,
                        attributions: lc.attributions
                    });
                    this.addloadingEvents(source);
                    layers.push(new TileLayer({
                        source,
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

    private addloadingEvents(source: TileImage): void {
        let counter = 0;
        source.on('tileloadstart', () => counter = this.increaseCounter(counter));
        source.on('tileloadend', () => counter = this.decreaseCounter(counter));
        source.on('tileloaderror', () => counter = this.decreaseCounter(counter));
    }

    private decreaseCounter(counter: number): number {
        counter--;
        if (counter === 0) {
            this.mapLoading.next(false);
        }
        return counter;
    }

    private increaseCounter(counter: number): number {
        if (counter === 0) {
            this.mapLoading.next(true);
        }
        counter++;
        return counter;
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
