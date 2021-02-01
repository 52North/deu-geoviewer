import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import { Zoom } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { pointerMove } from 'ol/events/condition';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import Select, { SelectEvent } from 'ol/interaction/Select';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { PROJECTIONS as EPSG_3857 } from 'ol/proj/epsg3857';
import { PROJECTIONS as EPSG_4326 } from 'ol/proj/epsg4326';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import { OSM, TileArcGISRest, TileWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';

import { ConfigurationService } from '../../configuration/configuration.service';
import { WMSLayer } from '../../services/wms.service';
import { FeatureInfoPopupComponent } from './feature-info-popup/feature-info-popup.component';
import { WmsFeatureInfoComponent } from './wms-feature-info/wms-feature-info.component';

export enum MapProjection {
  EPSG_4326 = 'EPSG:4326',
  EPSG_3857 = 'EPSG:3857',
  EPSG_3035 = 'EPSG:3035',
}

proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

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

type MapWmsLayer = {
  title: string;
  abstract: string;
  extent?: Extent;
  layer: Layer;
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges, OnInit {

  @Input() options?: MapOptions;

  public mapId = 'mapid';

  @ViewChild('dynamic', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  // ui flags
  public legendOpen = false;
  public featureInfoActive = true;

  // initialized WMS layer
  public wmsLayers: MapWmsLayer[] = [];

  // initialized geojson layer
  private vectorLayer!: VectorLayer;

  private overlay?: Overlay;

  private map!: Map;

  private zoomControl: Zoom = new Zoom();
  private projection!: Projection;
  private clickSelectGeojsonFeature!: Select;
  private hoverSelectGeojsonFeature!: Select;

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private config: ConfigurationService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      if (this.map) {
        this.map.removeControl(this.zoomControl);
        this.zoomControl = new Zoom({
          zoomInTipLabel: this.translate.instant('other-features.zoom-in'),
          zoomOutTipLabel: this.translate.instant('other-features.zoom-out')
        });
        this.map.addControl(this.zoomControl);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.options) {
      this.drawMap();
    }
  }

  ngAfterViewInit(): void {
    this.drawMap();
  }

  public toggleVisibility(layer: MapWmsLayer): void {
    layer.layer.setVisible(!layer.layer.getVisible());
  }

  public getLegendUrl(layer: MapWmsLayer): string | undefined {
    const source = layer.layer.getSource();
    if (source instanceof TileWMS) {
      return source.getLegendUrl();
    }
    return undefined;
  }

  public zoomToExtent(layer: MapWmsLayer): void {
    const extent = layer.extent;
    if (layer.extent) {
      this.map.getView().fit(layer.extent);
    }
  }

  public closePopup(): void {
    if (this.overlay) {
      this.overlay.setPosition(undefined);
    }
  }

  public toggleFeatureInfo(): void {
    this.featureInfoActive = !this.featureInfoActive;
    if (this.featureInfoActive) {
      this.activateFeatureInfo();
    } else {
      this.deactivateFeatureInfo();
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

  private drawMap(): void {
    if (this.options) {
      this.createPopup();
      this.projection = this.detectProjection();
      const layers = this.createBaseLayers(this.projection);
      let extent;

      if (this.options instanceof WmsOptions) {
        this.options.layers.forEach((e, i) => {
          const layer = new TileLayer({
            visible: false,
            source: new TileWMS({
              url: e.url,
              params: {
                LAYERS: e.name,
              },
            })
          });
          layers.push(layer);
          this.wmsLayers.push({
            title: e.title,
            abstract: e.abstract,
            layer,
            extent: e.bbox ? e.bbox as Extent : undefined
          });
        });
        setTimeout(() => this.legendOpen = true, 1000);
      }

      this.map = new Map({
        layers,
        controls: [],
        target: this.mapId,
        view: new View({
          projection: this.projection.getCode(),
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
        this.vectorLayer = new VectorLayer({ source: vectorSource });
        this.map.addLayer(this.vectorLayer);
        extent = vectorSource.getExtent();
      }

      this.activateFeatureInfo();

      extent = extent ? extent : this.getExtent(this.projection);
      this.map.getView().fit(extent);

      console.log(`Map with projection: ${this.projection.getCode()}`);
    }
  }

  private activateFeatureInfo(): void {
    if (this.options instanceof WmsOptions) {
      this.map.on('singleclick', this.featureInfoClick);
    }

    if (this.vectorLayer) {
      this.clickSelectGeojsonFeature = new Select({ layers: [this.vectorLayer] });
      this.clickSelectGeojsonFeature.on('select', (evt => {
        this.clickSelectGeojsonFeature.getFeatures().clear();
        this.showGeoJsonFeature(evt);
      }));
      this.map.addInteraction(this.clickSelectGeojsonFeature);

      this.hoverSelectGeojsonFeature = new Select({
        condition: pointerMove,
        layers: [this.vectorLayer]
      });
      this.hoverSelectGeojsonFeature.on('select', (evt => {
        this.map.getTargetElement().style.cursor = evt.selected.length > 0 ? 'pointer' : '';
      }));
      this.map.addInteraction(this.hoverSelectGeojsonFeature);
    }
  }

  private deactivateFeatureInfo(): void {
    this.map.un('singleclick', this.featureInfoClick);

    if (this.clickSelectGeojsonFeature) {
      this.map.removeInteraction(this.clickSelectGeojsonFeature);
    }
    if (this.hoverSelectGeojsonFeature) {
      this.map.removeInteraction(this.hoverSelectGeojsonFeature);
    }
  }

  private featureInfoClick = (evt: MapBrowserEvent<UIEvent>) => {
    const urls: string[] = [];
    this.wmsLayers.forEach(l => {
      if (l.layer.getVisible()) {
        const source = l.layer.getSource();
        if (source instanceof TileWMS) {
          const url = source.getFeatureInfoUrl(
            evt.coordinate,
            this.map.getView().getResolution() as number,
            this.projection.getCode(),
            { INFO_FORMAT: 'text/html' }
          );
          if (url) {
            urls.push(url);
          }
        }
      }
    });
    this.showWmsFeatureInfo(evt.coordinate, urls);
  }

  private detectProjection(): Projection {
    let projection = new Projection({ code: MapProjection.EPSG_4326 });

    if (this.options instanceof GeoJSONOptions) {
      const geojsonProj = new GeoJSON().readProjection(this.options.geojson);
      if (geojsonProj) {
        projection = geojsonProj;
      } else {
        throw new Error('No projection found for geojson');
      }
    }
    return projection;
  }

  private showGeoJsonFeature(evt: SelectEvent): void {
    if (this.overlay) {
      const coordinate = evt.mapBrowserEvent.coordinate;
      this.overlay.setPosition(coordinate);
      if (evt.selected.length) {
        const properties = evt.selected[0].getKeys().filter(e => e !== 'geometry').map(e => ({ key: e, value: evt.selected[0].get(e) }));
        this.viewContainerRef.clear();
        const factory = this.factoryResolver.resolveComponentFactory(FeatureInfoPopupComponent);
        const component = factory.create(this.viewContainerRef.injector);
        component.instance.properties = properties;
        this.viewContainerRef.insert(component.hostView);
      }
    }
  }

  private showWmsFeatureInfo(coordinate: Coordinate, urls: string[]): void {
    if (this.overlay) {
      this.overlay.setPosition(coordinate);
      this.viewContainerRef.clear();
      const factory = this.factoryResolver.resolveComponentFactory(WmsFeatureInfoComponent);
      const component = factory.create(this.viewContainerRef.injector);
      component.instance.featureInfoUrl = urls;
      this.viewContainerRef.insert(component.hostView);
    }
  }

  private getExtent(projection: Projection): Extent {
    const defExtent = this.config.configuration.defaultMapExtent.find(e => e.crs === projection.getCode());
    if (defExtent) {
      return defExtent.extent;
    } else {
      throw new Error(`No default extent configured for ${projection.getCode()}`);
    }
  }

  private createBaseLayers(projection: Projection): Layer[] {
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
