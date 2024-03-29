import { HttpClient, HttpXhrBackend } from '@angular/common/http';
import { ComponentFactoryResolver, ComponentRef, ViewContainerRef } from '@angular/core';
import { Map, View } from 'ol';
import { pointerMove } from 'ol/events/condition';
import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import Select, { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Icon, Stroke, Style, Text } from 'ol/style';
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
    location?: any;
    [key: string]: any;
}

export class FiwareMapHandler extends MapHandler {

    private httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));

    private vectorLayer!: VectorLayer<VectorSource<Geometry>>;
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

    private fetchData(): Observable<Feature<Geometry>[]> {
        return this.httpClient.get(`${this.proxyUrl}${this.options.url}`, { responseType: 'text' })
            .pipe(
                catchError(err => throwError(new NotAvailableError(this.options.url, this.options.resource, err))),
                map(res => {
                    try {
                        const resEntries = JSON.parse(res) as FiwareResponseEntry[];
                        return this.handleFiwareResponseEntries(resEntries);
                    } catch (error) {
                        const start = res.indexOf('[');
                        const end = res.lastIndexOf(']');
                        let temp = res.substring(start, end + 1);
                        while(temp.indexOf(' ') > 0) {
                            temp = temp.replace(' ','');
                        }
                        const resEntries = JSON.parse(temp);
                        return this.handleFiwareResponseEntries(resEntries);
                    }
                }
                )
            );
    }

    private handleFiwareResponseEntries(resEntries: FiwareResponseEntry[]): Feature<any>[] {
        return resEntries.map(e => new GeoJSON().readFeature(this.transformFeature(e)))
            .filter(e => {
                if (e.getGeometry() instanceof Point) {
                    const point = e.getGeometry() as Point;
                    const coords = point.getCoordinates();
                    return !coords.every(n => n === 0);
                }
                return true;
            });
    }

    private initMap(mapId: string, features: Feature<Geometry>[]): void {
        const projection = new Projection({ code: MapProjection.EPSG_4326 });
        const layers = this.createBaseLayers(projection);

        this.map = new Map({
            layers,
            controls: this.createControls(),
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
                style: (feature) => this.styleFeatures(feature)
            });
            this.map.addLayer(this.vectorLayer);
            const p = 50;
            this.map.getView().fit(vectorSource.getExtent(), { padding: [p, p, p, p] });
        } else {
            this.map.getView().fit(this.getDefaultExtent(projection));
        }
    }

    private styleFeatures(feature: FeatureLike, activate: boolean = false): Style[] {
        if (feature.getProperties()?.category?.length > 0 && feature.getProperties()?.category[0] === 'municipalServices' && feature.getProperties()?.vehicleType === "bus") {
            return [new Style({
                image: new CircleStyle({
                    radius: activate ? 9 : 7,
                    fill: new Fill({ color: this.getColor(feature) })
                }),
            })]
        } else if (feature.getProperties()?.type === 'OffStreetParking') {
            const p = activate ? 2 : 0;
            return [new Style({
                text: new Text({
                    text: 'P',
                    padding: [2 + p, 4 + p, 1 + p, 6 + p],
                    scale: 3,
                    fill: new Fill({ color: 'white' }),
                    backgroundStroke: new Stroke({
                        width: 1
                    }),
                    backgroundFill: new Fill({ color: '#1c47e2' }),
                }),
            }),
            new Style({
                text: new Text({ text: feature.getProperties()?.availableSpotNumber, scale: 1.2, offsetX: 10, offsetY: 10, fill: new Fill({ color: 'white' }) })
            })]
        } else if (feature.getProperties().type === 'BikeHireDockingStation') {
            return [
                new Style({
                    image: new Icon({
                        anchor: [0.5, 0.5],
                        scale: 0.8,
                        src: './assets/images/bike.png',
                    }),
                })
            ]
        }
        return [];
    }

    private updateData(features: Feature<Geometry>[]): void {
        let source = this.vectorLayer.getSource();
        if (!source) {
            this.vectorLayer.setSource(source = new VectorSource<Geometry>())
        } else {
            source.clear();
        }
        
        source.addFeatures(features);
    }

    private transformFeature(payload: FiwareResponseEntry) {
        const geom = payload.location?.type === 'geo:json' ? payload.location.value : payload.location;
        delete payload.location;
        let properties: any = {}
        Object.keys(payload).forEach(key => {
            properties[key] = payload[key].hasOwnProperty('value') ? payload[key].value : payload[key];
        });
        return {
            type: 'Feature',
            properties,
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
                style: feature => this.styleFeatures(feature, true),
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
                    .filter((e: any) => e !== 'geometry')
                    .map((e: any) => ({ key: e, value: evt.selected[0].get(e) }));
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
