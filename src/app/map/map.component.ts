import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Map, Overlay, View } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { pointerMove } from 'ol/events/condition';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import Select, { SelectEvent } from 'ol/interaction/Select';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import { OSM, TileArcGISRest } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';

import { FeatureInfoPopupComponent } from './../feature-info-popup/feature-info-popup.component';

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
  constructor(public url: string) {
    super();
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() options: MapOptions | undefined;

  public mapId = 'mapid';

  private projection: Projection = new Projection({ code: MapProjection.EPSG_4326 });

  private overlay: Overlay | undefined;

  @ViewChild('dynamic', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  constructor(
    private factoryResolver: ComponentFactoryResolver
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.options) {
      this.drawMap();
    }
  }

  ngAfterViewInit(): void {
    this.drawMap();
    this.createPopup();
  }

  private createPopup(): void {
    const closer = document.getElementById('popup-closer');
    if (closer) {
      closer.onclick = () => {
        if (this.overlay) {
          this.overlay.setPosition(undefined);
          closer.blur();
        }
        return false;
      };
    }

    const popup = document.getElementById('popup');
    if (popup) {
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
      const layers = this.createBaseLayers();
      let extent;

      if (this.options instanceof GeoJSONOptions) {
        const projection = new GeoJSON().readProjection(this.options.geojson);
        if (projection) {
          this.projection = projection;
        } else {
          throw new Error('No projection found for geojson');
        }
      }

      const map = new Map({
        layers,
        controls: defaultControls(),
        target: this.mapId,
        view: new View({
          projection: this.projection,
          maxZoom: 18
        })
      });

      if (this.overlay) {
        map.addOverlay(this.overlay);
      }

      if (this.options instanceof GeoJSONOptions) {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(this.options.geojson),
        });
        const vectorLayer = new VectorLayer({
          source: vectorSource
        });
        map.addLayer(vectorLayer);
        // TODO: detect projection
        extent = vectorSource.getExtent();

        const hoverSelect = new Select({
          condition: pointerMove,
          layers: [vectorLayer]
        });
        hoverSelect.on('select', (evt => {
          map.getTargetElement().style.cursor = evt.selected.length > 0 ? 'pointer' : '';
        }));
        map.addInteraction(hoverSelect);

        const clickSelect = new Select({
          layers: [vectorLayer]
        });
        clickSelect.on('select', (evt => {
          clickSelect.getFeatures().clear();
          this.showPopup(evt, map);
        }));
        map.addInteraction(clickSelect);
      }

      map.getView().fit(extent ? extent : this.getExtent());

      const scaleLine = new ScaleLine({ units: 'metric' });
      map.addControl(scaleLine);

      map.getView().on('change:resolution', (evt) => {
        console.log(map.getView().getZoom());
      });
    }
  }

  private showPopup(evt: SelectEvent, map: Map): void {
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

  private getExtent(): Extent {
    switch (this.projection.getCode()) {
      case MapProjection.EPSG_4326:
        return [-9.8814, 33.7852, 31.441, 61.7495];
      case MapProjection.EPSG_3857:
        return [-1100000, 4000000, 3500000, 8800000];
      case MapProjection.EPSG_3035:
        return [1896628, 1507846, 4662111, 6829874];
      default:
        return [-9.8814, 33.7852, 31.441, 61.7495];
    }
  }

  private createBaseLayers(): Layer[] {
    const layers: Layer[] = [];
    const mapswitch = 11;
    layers.push(new TileLayer({
      source: new OSM(), // TODO: change layer
      minZoom: mapswitch
    }));
    switch (this.projection.getCode()) {
      case MapProjection.EPSG_4326:
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_4326/MapServer', }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_4326/MapServer' }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_4326/MapServer' }),
          maxZoom: mapswitch
        }));
        break;
      case MapProjection.EPSG_3857:
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_3857/MapServer' }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_3857/MapServer' }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_3857/MapServer' }),
          maxZoom: mapswitch
        }));
        break;
      case MapProjection.EPSG_3035:
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_3035/MapServer' }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_3035/MapServer' }),
          maxZoom: mapswitch
        }));
        layers.push(new TileLayer({
          source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_3035/MapServer' }),
          maxZoom: mapswitch
        }));
        break;
      default:
        break;
    }
    return layers;
  }
}
