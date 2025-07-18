import {
  ComponentFactoryResolver,
  ComponentRef,
  inject,
  Injectable,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { Map, View } from 'ol';
import { pointerMove } from 'ol/events/condition';
import { extend } from 'ol/extent';
import { GeoJSON } from 'ol/format';
import Select, { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import { Projection, transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigurationService } from '../../../configuration/configuration.service';
import {
  Collection,
  CollectionResponse,
  LandingPage,
  Link,
  OGCFeaturesService,
  UNVALID_LANDING_PAGE,
} from '../../../services/OGCFeatures.service';
import { CollectionComponent } from '../collection/collection.component';
import { FeatureInfoPopupComponent } from '../feature-info-popup/feature-info-popup.component';
import { FeaturesLoadedHintComponent } from '../features-loaded-hint/features-loaded-hint.component';
import { MapHandler } from './map-handler';
import { MapProjection, OGCFeaturesOptions } from './model';

interface OGCFeatureMapHandlerProps {
  popupContainerRef: ViewContainerRef;
  dynamicContainerRef: ViewContainerRef;
  options: OGCFeaturesOptions;
}

export interface FeatureResult {
  completeCount: number;
  displayedCount: number;
}

const COLLECTION_ITEMS_COUNT = 100;

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
  }),
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
  }),
});

// TODO: reload with extent on zoom: https://ogc-api.nrw.de/inspire-lc-le/v1/collections/landcoverunit/items?limit=100&bbox=7.3275,51.7735,7.9514,52.0531&f=json

@Injectable({
  providedIn: 'root',
})
export class OGCFeatureMapHandler extends MapHandler {
  private factoryResolver = inject(ComponentFactoryResolver);
  private ogcFeatureSrvc = inject(OGCFeaturesService);
  private options: OGCFeaturesOptions | undefined;
  private dynamicContainerRef: ViewContainerRef | undefined;
  private popupContainerRef: ViewContainerRef | undefined;
  private serviceUrl: string | undefined;

  private collectionComponent: ComponentRef<CollectionComponent> | undefined;
  private featureHintComponent:
    | ComponentRef<FeaturesLoadedHintComponent>
    | undefined;
  private vectorSource: VectorSource = new VectorSource();
  private vectorLayer: VectorLayer<VectorSource>;

  private _loadingFeatures = signal(false);
  private _featureResults = signal<FeatureResult | undefined>(undefined);
  private _selectedCollection = signal<Collection | undefined>(undefined);

  private clickSelectGeojsonFeature: Select | undefined;
  private hoverSelectGeojsonFeature: Select | undefined;

  private nextFeaturesUrl: Link | undefined;

  constructor() {
    super(inject(ConfigurationService));
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: featureStyle,
    });
  }

  get loadingFeatures() {
    return this._loadingFeatures.asReadonly();
  }

  get featureResults() {
    return this._featureResults.asReadonly();
  }

  get selectedCollection() {
    return this._selectedCollection.asReadonly();
  }

  setProps(props: OGCFeatureMapHandlerProps) {
    this.options = props.options;
    this.dynamicContainerRef = props.dynamicContainerRef;
    this.popupContainerRef = props.popupContainerRef;
    this.createPopup();
  }

  createMap(mapId: string): Observable<void> {
    return this.determineUrl(this.options!.url).pipe(
      catchError(err => {
        console.error(err);
        throw err;
      }),
      map(res => {
        this.initMap(mapId, res.extent?.spatial);
        if (this.serviceUrl) {
          this.ogcFeatureSrvc.getCollections(this.serviceUrl).subscribe({
            next: coll => this.showCollections(coll),
            error: err => console.error(err),
          });
        }
      })
    );
  }

  mapViewDestroyed(): void {
    throw new Error('Method not implemented.');
  }

  activateFeatureInfo(): void {
    if (this.vectorLayer) {
      this.clickSelectGeojsonFeature = new Select({
        layers: [this.vectorLayer],
      });
      this.clickSelectGeojsonFeature.on('select', evt => {
        this.clickSelectGeojsonFeature!.getFeatures().clear();
        this.showGeoJsonFeature(evt);
      });
      this.map.addInteraction(this.clickSelectGeojsonFeature);

      this.hoverSelectGeojsonFeature = new Select({
        condition: pointerMove,
        style: featureHoverStyle,
        layers: [this.vectorLayer],
      });
      this.hoverSelectGeojsonFeature.on('select', evt => {
        this.map.getTargetElement().style.cursor =
          evt.selected.length > 0 ? 'pointer' : '';
      });
      this.map.addInteraction(this.hoverSelectGeojsonFeature);
    }
  }

  private showGeoJsonFeature(evt: SelectEvent) {
    if (this.overlay && this.popupContainerRef) {
      const coordinate = evt.mapBrowserEvent.coordinate;
      this.overlay.setPosition(coordinate);
      if (evt.selected.length) {
        const properties = evt.selected[0]
          .getKeys()
          .filter(e => e !== 'geometry')
          .map(e => ({ key: e, value: evt.selected[0].get(e) }));
        this.popupContainerRef.clear();
        const factory = this.factoryResolver.resolveComponentFactory(
          FeatureInfoPopupComponent
        );
        const component = factory.create(this.popupContainerRef.injector);
        component.setInput('properties', properties);
        this.popupContainerRef.insert(component.hostView);
      }
    }
  }

  deactivateFeatureInfo(): void {
    if (this.clickSelectGeojsonFeature) {
      this.map.removeInteraction(this.clickSelectGeojsonFeature);
    }
    if (this.hoverSelectGeojsonFeature) {
      this.map.removeInteraction(this.hoverSelectGeojsonFeature);
    }
  }

  loadCollection(collection: Collection) {
    this._selectedCollection.set(collection);
    this.nextFeaturesUrl = undefined;
    if (collection.extent?.spatial) {
      this.fixToExtent(collection.extent?.spatial);
    }
    this.vectorSource.clear();
    this._loadingFeatures.set(true);
    this.ogcFeatureSrvc
      .getCollectionItems(collection, this.serviceUrl, {
        limit: COLLECTION_ITEMS_COUNT,
      })
      .subscribe({
        next: items => {
          this.vectorSource.addFeatures(new GeoJSON().readFeatures(items));
          const nextLink = items.links?.find(e => e.rel === 'next');
          if (nextLink) {
            this._featureResults.set({
              completeCount: items.numberMatched,
              displayedCount: items.numberReturned,
            });
          }
          this.nextFeaturesUrl = nextLink;
          this._loadingFeatures.set(false);
        },
        error: err => console.error(err),
      });
  }

  loadAdditionalFeatures() {
    if (this.nextFeaturesUrl) {
      this._loadingFeatures.set(true);
      this.ogcFeatureSrvc
        .getCollectionItemsByNextLink(this.nextFeaturesUrl)
        .subscribe({
          next: items => {
            this.vectorSource.addFeatures(new GeoJSON().readFeatures(items));
            const nextLink = items.links?.find(e => e.rel === 'next');
            this._featureResults.update(prev => {
              const previousDisplayCount = prev?.displayedCount
                ? prev.displayedCount
                : 0;
              return {
                completeCount: items.numberMatched,
                displayedCount: previousDisplayCount + items.numberReturned,
              };
            });
            this.nextFeaturesUrl = nextLink;
            this._loadingFeatures.set(false);
          },
          error: err => console.error(err),
        });
    }
  }

  private initMap(
    mapId: string,
    spatial: { description?: string; bbox: number[][]; crs: string } | undefined
  ) {
    const projection = new Projection({ code: MapProjection.EPSG_4326 });
    const layers = this.createBaseLayers(projection);

    this.map = new Map({
      layers,
      controls: this.createControls(),
      target: mapId,
      view: new View({
        projection: projection.getCode(),
        maxZoom: 18,
      }),
    });

    if (this.overlay) {
      this.map.addOverlay(this.overlay);
    }

    this.map.addLayer(this.vectorLayer);

    if (spatial) {
      this.fixToExtent(spatial);
    } else {
      this.map.getView().fit(this.getDefaultExtent(projection));
    }

    this.initFeaturesHint();
  }

  private fixToExtent(spatial: {
    description?: string;
    bbox: number[][];
    crs: string;
  }) {
    const mergedExtent = spatial.bbox.reduce((a, b) => extend(a, b));
    const extent = transformExtent(
      mergedExtent,
      spatial.crs,
      MapProjection.EPSG_4326
    );
    this.map.getView().fit(extent);
  }

  private determineUrl(url: string): Observable<LandingPage> {
    this.serviceUrl = url;
    return this.ogcFeatureSrvc.getLandingPage(url).pipe(
      catchError(err => {
        if (err.message === UNVALID_LANDING_PAGE) {
          const idx = url.lastIndexOf('/');
          const newUrl = url.slice(0, idx);
          return this.determineUrl(newUrl);
        } else {
          throw err;
        }
      })
    );
  }

  private showCollections(coll: CollectionResponse): void {
    if (!this.collectionComponent) {
      const factory =
        this.factoryResolver.resolveComponentFactory(CollectionComponent);
      this.collectionComponent = factory.create(
        this.dynamicContainerRef!.injector
      );
      this.dynamicContainerRef!.insert(this.collectionComponent.hostView);
    }
    this.collectionComponent.instance.collectionResponse = coll;
  }

  private initFeaturesHint() {
    if (!this.featureHintComponent) {
      const factory = this.factoryResolver.resolveComponentFactory(
        FeaturesLoadedHintComponent
      );
      this.featureHintComponent = factory.create(
        this.dynamicContainerRef!.injector
      );
      this.dynamicContainerRef!.insert(this.featureHintComponent.hostView);
    }
  }
}
