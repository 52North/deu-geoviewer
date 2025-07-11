import { ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Map, MapBrowserEvent, View } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import Projection from 'ol/proj/Projection';
import TileWMS from 'ol/source/TileWMS';
import { Observable, of } from 'rxjs';

import { ConfigurationService } from '../../../configuration/configuration.service';
import { WmsFeatureInfoComponent } from '../wms-feature-info/wms-feature-info.component';
import { MapHandler } from './map-handler';
import { MapProjection, WmsOptions } from './model';

export class WmsMapHandler extends MapHandler {
  private projection: Projection = new Projection({
    code: MapProjection.EPSG_4326,
  });

  constructor(
    protected config: ConfigurationService,
    private viewContainerRef: ViewContainerRef,
    private factoryResolver: ComponentFactoryResolver,
    private options: WmsOptions
  ) {
    super(config);
  }

  public createMap(mapId: string): Observable<void> {
    const layers = this.createBaseLayers(this.projection);

    this.options.layers.forEach((e) => {
      const layer = new TileLayer({
        visible: false,
        source: new TileWMS({
          url: e.url,
          params: {
            LAYERS: e.name,
          },
        }),
      });
      layers.push(layer);
      this.legendEntries.push({
        title: e.title,
        abstract: e.abstract,
        layer,
        queryable: e.queryable,
        extent: e.bbox ? (e.bbox as Extent) : undefined,
      });
    });

    this.map = new Map({
      layers,
      controls: this.createControls(),
      target: mapId,
      view: new View({
        projection: this.projection.getCode(),
        maxZoom: 18,
      }),
    });

    if (this.overlay) {
      this.map.addOverlay(this.overlay);
    }

    this.map.getView().fit(this.getDefaultExtent(this.projection));
    return of(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public mapViewDestroyed(): void {}

  public activateFeatureInfo(): void {
    if (this.options instanceof WmsOptions) {
      this.map.on('singleclick', this.featureInfoClick);
    }
  }

  private featureInfoClick = (evt: MapBrowserEvent<UIEvent>) => {
    if (this.legendEntries.some((e) => e.layer.getVisible() && e.queryable)) {
      const urls: string[] = [];
      this.legendEntries.forEach((l) => {
        if (l.layer.getVisible() && l.queryable) {
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
  };

  private showWmsFeatureInfo(coordinate: Coordinate, urls: string[]): void {
    if (this.overlay) {
      this.overlay.setPosition(coordinate);
      this.viewContainerRef.clear();
      const factory = this.factoryResolver.resolveComponentFactory(
        WmsFeatureInfoComponent
      );
      const component = factory.create(this.viewContainerRef.injector);
      component.setInput('featureInfoUrl', urls);
      this.viewContainerRef.insert(component.hostView);
    }
  }

  public deactivateFeatureInfo(): void {
    this.map.un('singleclick', this.featureInfoClick);
  }
}
