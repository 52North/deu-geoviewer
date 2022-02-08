import { ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Map, View } from 'ol';
import { pointerMove } from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Select, { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Observable, of } from 'rxjs';

import { ConfigurationService } from '../../../configuration/configuration.service';
import { NotSupportedError, NotSupportedReason } from '../../../services/error-handling/model';
import { FeatureInfoPopupComponent } from '../feature-info-popup/feature-info-popup.component';
import { MapHandler } from './map-handler';
import { GeoJSONOptions } from './model';

const featureStyle = new Style({
    stroke: new Stroke({
        color: 'magenta',
        width: 2,
    }),
    fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
    }),
    image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'magenta' }),
        stroke: new Stroke({ color: 'magenta', width: 2 }),
    })
});

const featureHoverStyle = new Style({
    stroke: new Stroke({
        color: 'magenta',
        width: 5,
    }),
    fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
    }),
    image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: '#36ff33' }),
        stroke: new Stroke({ color: '#36ff33', width: 2 }),
    })
});

export class GeoJsonMapHandler extends MapHandler {

    private vectorLayer!: VectorLayer<VectorSource<Geometry>>;
    private clickSelectGeojsonFeature!: Select;
    private hoverSelectGeojsonFeature!: Select;

    constructor(
        protected config: ConfigurationService,
        private viewContainerRef: ViewContainerRef,
        private factoryResolver: ComponentFactoryResolver,
        private options: GeoJSONOptions,
    ) {
        super(config);
    }

    public createMap(mapId: string): Observable<void> {
        const projection = this.detectProjection();
        const layers = this.createBaseLayers(projection);
        let extent;

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

        if (this.options instanceof GeoJSONOptions) {
            const vectorSource = new VectorSource({
                features: new GeoJSON().readFeatures(this.options.geojson),
            });
            this.vectorLayer = new VectorLayer({ source: vectorSource, style: featureStyle });
            this.map.addLayer(this.vectorLayer);
            extent = vectorSource.getExtent();
        }

        extent = extent ? extent : this.getDefaultExtent(projection);
        this.map.getView().fit(extent);

        return of(undefined);
    }

    public mapViewDestroyed(): void { }

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
                style: featureHoverStyle,
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

    private showGeoJsonFeature(evt: SelectEvent): void {
        if (this.overlay) {
            const coordinate = evt.mapBrowserEvent.coordinate;
            this.overlay.setPosition(coordinate);
            if (evt.selected.length) {
                const properties = evt.selected[0].getKeys()
                    .filter((e: any) => e !== 'geometry')
                    .map((e: any) => ({ key: e, value: evt.selected[0].get(e) }));
                this.viewContainerRef.clear();
                const factory = this.factoryResolver.resolveComponentFactory(FeatureInfoPopupComponent);
                const component = factory.create(this.viewContainerRef.injector);
                component.instance.properties = properties;
                this.viewContainerRef.insert(component.hostView);
            }
        }
    }

    private detectProjection(): Projection {
        try {
            if (this.options.geojson.crs && !this.options.geojson.crs?.type) {
                delete this.options.geojson.crs;
            }
            const geojsonProj = new GeoJSON().readProjection(this.options.geojson);
            if (geojsonProj) {
                return geojsonProj;
            } else {
                throw new NotSupportedError(this.options.url, this.options.resource, NotSupportedReason.crs);
            }
        } catch (error) {
            throw new NotSupportedError(this.options.url, this.options.resource, NotSupportedReason.crs);
        }
    }

}
