import { HttpClient, HttpXhrBackend } from '@angular/common/http';
import { ComponentFactoryResolver, ComponentRef, ViewContainerRef } from '@angular/core';
import { Map, View } from 'ol';
import Attribution from 'ol/control/Attribution';
import { pointerMove } from 'ol/events/condition';
import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Select, { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Style } from 'ol/style';
import Fill from 'ol/style/Fill';
import { interval, Observable, Subscription, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigurationService } from '../../../configuration/configuration.service';
import { NotAvailableError } from '../../../services/error-handling/model';
import { FeatureInfoPopupComponent } from '../feature-info-popup/feature-info-popup.component';
import { CounterComponent } from './../counter/counter.component';
import { MapHandler } from './map-handler';
import { FiwareOptions, MapProjection } from './model';


interface FiwareResponseEntry {
    id: string;
    location?: GeoJSON.Point;
    [key: string]: any;
}

export class FiwareMapHandler extends MapHandler {

    private httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));

    private vectorLayer!: VectorLayer;
    private clickSelectGeojsonFeature!: Select;
    private hoverSelectGeojsonFeature!: Select;

    private colorMap: string[] = [];

    private counter = 0;
    private secondsTillReload = 60;
    private counterComponent!: ComponentRef<CounterComponent>;
    private intervalSubscription!: Subscription;

    constructor(
        protected config: ConfigurationService,
        private popupContainerRef: ViewContainerRef,
        private dynamicContainerRef: ViewContainerRef,
        private factoryResolver: ComponentFactoryResolver,
        private options: FiwareOptions,
        private proxyUrl: string,
    ) {
        super(config);
    }

    public createMap(mapId: string): Observable<void> {
        this.intervalSubscription = interval(1000).pipe().subscribe(() => {
            this.counter++;
            this.setCounterView(this.secondsTillReload - this.counter);
            if (this.counter >= this.secondsTillReload) {
                this.counter = 0;
                this.fetchData().subscribe(res => this.updateData(res));
            }
        });
        return this.fetchData().pipe(map(res => this.initMap(mapId, res)));
    }

    public mapViewDestroyed(): void {
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe();
        }
    }

    private fetchData(): Observable<Feature[]> {
        return this.httpClient.get<FiwareResponseEntry[]>(`${this.proxyUrl}${this.options.url}`)
            .pipe(
                catchError(err => throwError(new NotAvailableError(this.options.url, this.options.resource, err))),
                map(res => res.map(e => new GeoJSON().readFeature(this.transformFeature(e))))
            );
    }

    private initMap(mapId: string, features: Feature[]): void {
        const projection = new Projection({ code: MapProjection.EPSG_4326 });
        const layers = this.createBaseLayers(projection);

        this.map = new Map({
            layers,
            controls: [new Attribution()],
            target: mapId,
            view: new View({
                projection: projection.getCode(),
                maxZoom: 18
            })
        });

        if (this.overlay) {
            this.map.addOverlay(this.overlay);
        }

        if (features.length) {
            const vectorSource = new VectorSource({ features });
            this.vectorLayer = new VectorLayer({
                source: vectorSource,
                style: (feature) => {
                    return new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({ color: this.getColor(feature) })
                        }),
                    });
                }
            });
            this.map.addLayer(this.vectorLayer);
            this.map.getView().fit(vectorSource.getExtent());
        } else {
            this.map.getView().fit(this.getDefaultExtent(projection));
        }
    }

    private updateData(features: Feature[]): void {
        const source = this.vectorLayer.getSource();
        source.clear();
        source.addFeatures(features);
    }

    private transformFeature(payload: FiwareResponseEntry): any {
        const geom = payload.location;
        delete payload.location;
        return {
            type: 'Feature',
            properties: payload,
            geometry: geom
        };
    }

    public activateFeatureInfo(): void {
        if (this.vectorLayer) {
            this.clickSelectGeojsonFeature = new Select({ layers: [this.vectorLayer] });
            this.clickSelectGeojsonFeature.on('select', (evt => {
                this.clickSelectGeojsonFeature.getFeatures().clear();
                this.showGeoJsonFeature(evt);
            }));
            this.map.addInteraction(this.clickSelectGeojsonFeature);

            this.hoverSelectGeojsonFeature = new Select({
                condition: pointerMove,
                style: (feature) => {
                    return new Style({
                        image: new CircleStyle({
                            radius: 9,
                            fill: new Fill({ color: this.getColor(feature) })
                        }),
                    });
                },
                layers: [this.vectorLayer]
            });
            this.hoverSelectGeojsonFeature.on('select', (evt => {
                this.map.getTargetElement().style.cursor = evt.selected.length > 0 ? 'pointer' : '';
            }));
            this.map.addInteraction(this.hoverSelectGeojsonFeature);
        }
    }

    public deactivateFeatureInfo(): void {
        if (this.clickSelectGeojsonFeature) {
            this.map.removeInteraction(this.clickSelectGeojsonFeature);
        }
        if (this.hoverSelectGeojsonFeature) {
            this.map.removeInteraction(this.hoverSelectGeojsonFeature);
        }
    }

    private getColor(feature: FeatureLike): string {
        if (!feature.getProperties()?.lineNumber) {
            return 'black';
        }
        const lineNumber = feature.getProperties().lineNumber;
        if (this.colorMap[lineNumber] === undefined) {
            const r = Math.round(Math.random() * 255);
            const g = Math.round(Math.random() * 255);
            const b = Math.round(Math.random() * 255);
            // tslint:disable-next-line: no-bitwise
            this.colorMap[lineNumber] = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        return this.colorMap[lineNumber];
    }

    private showGeoJsonFeature(evt: SelectEvent): void {
        if (this.overlay) {
            const coordinate = evt.mapBrowserEvent.coordinate;
            this.overlay.setPosition(coordinate);
            if (evt.selected.length) {
                const properties = evt.selected[0].getKeys()
                    .filter(e => e !== 'geometry')
                    .map(e => ({ key: e, value: evt.selected[0].get(e) }));
                this.popupContainerRef.clear();
                const factory = this.factoryResolver.resolveComponentFactory(FeatureInfoPopupComponent);
                const component = factory.create(this.popupContainerRef.injector);
                component.instance.properties = properties;
                this.popupContainerRef.insert(component.hostView);
            }
        }
    }

    private setCounterView(count: number): void {
        if (!this.counterComponent) {
            const factory = this.factoryResolver.resolveComponentFactory(CounterComponent);
            this.counterComponent = factory.create(this.popupContainerRef.injector);
            this.dynamicContainerRef.insert(this.counterComponent.hostView);
        }
        this.counterComponent.instance.count = count;
    }

}
