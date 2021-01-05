import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Map, View } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { register } from 'ol/proj/proj4';
import { OSM, TileArcGISRest } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';

export enum MapProjection {
  EPSG_4326 = 'EPSG:4326',
  EPSG_3857 = 'EPSG:3857',
  EPSG_3035 = 'EPSG:3035',
}

proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
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

  public mapId: string = 'mapid';

  private projection = MapProjection.EPSG_4326;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.options) {
      this.drawMap();
    }
  }

  ngAfterViewInit(): void {
    this.drawMap();
  }

  private drawMap() {
    if (this.options) {
      const layers = this.createBaseLayers();
      let extent;

      if (this.options instanceof GeoJSONOptions) {
        var vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(this.options.geojson),
        });
        var vectorLayer = new VectorLayer({
          source: vectorSource
          // style: styleFunction,
        });
        layers.push(vectorLayer);
        // TODO: detect projection
        extent = vectorSource.getExtent();
        console.log(extent);
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

      map.getView().fit(extent ? extent : this.getExtent());

      const scaleLine = new ScaleLine({ units: 'metric' });
      map.addControl(scaleLine);

      map.getView().on('change:resolution', (evt) => {
        console.log(map.getView().getZoom());
      });
    }
  }

  private getExtent(): Extent {
    switch (this.projection) {
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

  private createBaseLayers() {
    const layers: Layer[] = [];
    layers.push(new TileLayer({
      source: new OSM(), // TODO: change layer
      minZoom: 10
    }));
    switch (this.projection) {
      case MapProjection.EPSG_4326:
        layers.push(new TileLayer({
          source: new TileArcGISRest({
            url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_4326/MapServer',
          }),
          maxZoom: 10
        }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_4326/MapServer' }) }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_4326/MapServer' }) }))
        break;
      case MapProjection.EPSG_3857:
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_3857/MapServer' }) }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_3857/MapServer' }) }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_3857/MapServer' }) }))
        break;
      case MapProjection.EPSG_3035:
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CountriesEurope_3035/MapServer' }) }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CitiesRoadsRiversLakes_3035/MapServer' }) }))
        layers.push(new TileLayer({ source: new TileArcGISRest({ url: 'https://webgate.ec.europa.eu/estat/inspireec/gis/arcgis/rest/services/Basemaps/CityNamesEurope_3035/MapServer' }) }))
        break;
      default:
        break;
    }
    return layers;
  }
}
