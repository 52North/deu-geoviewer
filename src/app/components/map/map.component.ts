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
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() options?: MapOptions;

  public mapId = 'mapid';

  @ViewChild('dynamic', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  // ui flags
  public legendOpen = false;
  public featureInfoActive = true;

  public legendEntries: LegendEntry[] = [];

  private mapHandler: MapHandler | undefined;

  constructor(
    private factoryResolver: ComponentFactoryResolver,
    private config: ConfigurationService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.options) {
      this.initMap();
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  public toggleVisibility(legendEntry: LegendEntry): void {
    legendEntry.layer.setVisible(!legendEntry.layer.getVisible());
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
    if (this.options) {
      this.mapHandler = this.findMapHandler(this.options);
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
      return new WmsMapHandler(this.config, this.viewContainerRef, this.factoryResolver, options);
    }
    if (options instanceof GeoJSONOptions) {
      return new GeoJsonMapHandler(this.config, this.viewContainerRef, this.factoryResolver, options);
    }
    if (options instanceof FiwareOptions) {
      return new FiwareMapHandler(this.config, this.viewContainerRef, this.factoryResolver, options);
    }
    return new EmptyMapHandler(this.config);
  }

}
