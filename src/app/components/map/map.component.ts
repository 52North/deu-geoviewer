import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TileWMS } from 'ol/source';

import { ConfigurationService } from '../../configuration/configuration.service';
import { EmptyMapHandler } from './maphandler/empty-map-handler';
import { FiwareMapHandler } from './maphandler/firware-map-handler';
import { GeoJsonMapHandler } from './maphandler/geojson-map-handler';
import { MapHandler } from './maphandler/map-handler';
import { FiwareOptions, GeoJSONOptions, LegendEntry, MapOptions, WmsOptions } from './maphandler/model';
import { WmsMapHandler } from './maphandler/wms-map-handler';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() options?: MapOptions;

  public mapLoading!: boolean;

  public mapId = 'mapid';

  @ViewChild('popupContent', { read: ViewContainerRef }) popupContentContainerRef!: ViewContainerRef;

  @ViewChild('dynamic', { read: ViewContainerRef }) dynamicContainerRef!: ViewContainerRef;

  // ui flags
  public legendOpen = false;
  public featureInfoActive = true;

  private initialZoomEnabled = true;

  public legendEntries: LegendEntry[] = [];

  private mapHandler: MapHandler | undefined;

  private viewInit = false;

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private config: ConfigurationService,
    @Inject('PROXY_URL') private proxyUrl: string,
  ) { }

  ngOnDestroy(): void {
    if (this.mapHandler) {
      this.mapHandler.mapViewDestroyed();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.options) {
      this.initMap();
    }
  }

  ngAfterViewInit(): void {
    this.viewInit = true;
    this.initMap();
  }

  public toggleVisibility(legendEntry: LegendEntry): void {
    legendEntry.layer.setVisible(!legendEntry.layer.getVisible());
    if (this.initialZoomEnabled) {
      this.zoomToExtent(legendEntry);
      this.initialZoomEnabled = false;
    }
  }

  public getLegendUrl(legendEntry: LegendEntry): string | undefined {
    const source = legendEntry.layer.getSource();
    if (source instanceof TileWMS) {
      return source.getLegendUrl();
    }
    return undefined;
  }

  public zoomToExtent(legendEntry: LegendEntry): void {
    if (legendEntry.extent) {
      this.mapHandler?.zoomToExtent(legendEntry.extent);
    }
  }

  public closePopup(): void {
    this.mapHandler?.closePopup();
  }

  public toggleFeatureInfo(): void {
    this.featureInfoActive = !this.featureInfoActive;
    if (this.featureInfoActive) {
      this.mapHandler?.activateFeatureInfo();
    } else {
      this.mapHandler?.deactivateFeatureInfo();
    }
  }

  public zoomIn(): void {
    this.mapHandler?.zoomIn();
  }

  public zoomOut(): void {
    this.mapHandler?.zoomOut();
  }

  private initMap(): void {
    if (this.options && this.viewInit) {
      this.mapHandler = this.findMapHandler(this.options);
      this.mapHandler.mapLoading.subscribe(ml => this.mapLoading = ml);
      this.mapHandler.createMap(this.mapId).subscribe(() => {
        this.mapHandler?.activateFeatureInfo();
        const entries = this.mapHandler?.getLegendEntries();
        if (entries) {
          this.legendEntries = entries;
          if (this.legendEntries?.length) { setTimeout(() => this.legendOpen = true, 1000); }
        }
      });
    }
  }

  private findMapHandler(options: MapOptions): MapHandler {
    if (options instanceof WmsOptions) {
      return new WmsMapHandler(this.config, this.popupContentContainerRef, this.factoryResolver, options);
    }
    if (options instanceof GeoJSONOptions) {
      return new GeoJsonMapHandler(this.config, this.popupContentContainerRef, this.factoryResolver, options);
    }
    if (options instanceof FiwareOptions) {
      return new FiwareMapHandler(
        this.config, this.popupContentContainerRef, this.dynamicContainerRef, this.factoryResolver, options, this.proxyUrl
      );
    }
    return new EmptyMapHandler(this.config);
  }

}
