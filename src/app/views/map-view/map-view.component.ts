import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GeoJSONOptions, MapOptions, WmsOptions } from '../../components/map/maphandler/model';
import { LegalDisclaimerService } from '../../components/modals/legal-disclaimer/legal-disclaimer.component';
import { LoadingDatasetComponent } from '../../components/modals/loading-dataset/loading-dataset.component';
import { DatasetType, parseDatasetType } from '../../model';
import { DatasetService } from '../../services/dataset.service';
import { GeneralErrorHandler } from '../../services/error-handling/general-error-handler.service';
import { EdpError } from '../../services/error-handling/model';
import { FiwareOptions } from './../../components/map/maphandler/model';
import { WelcomeScreenService } from './../../components/modals/welcome/welcome.component';
import { TutorialService } from './../../services/intro.service';
import { WmsService } from './../../services/wms.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

  public mapOptions: MapOptions | undefined;

  private loadingOverlayRef!: OverlayRef;

  constructor(
    private datasetSrvc: DatasetService,
    private route: ActivatedRoute,
    private wmsSrvc: WmsService,
    private welcomeSrvc: WelcomeScreenService,
    private tutorialSrvc: TutorialService,
    private errorSrvc: GeneralErrorHandler,
    private legalDisclaimerSrvc: LegalDisclaimerService,
    public overlay: Overlay
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const datasetId = params.dataset;
    const type = params.type;
    if (datasetId) {
      this.loadDataset(datasetId, type);
    } else {
      this.mapOptions = new MapOptions();
    }
  }

  public openWelcome(): void {
    this.welcomeSrvc.openOverlay();
  }

  public openTutorial(): void {
    this.tutorialSrvc.openTutorial();
  }

  public openLegalDisclaimer(): void {
    this.legalDisclaimerSrvc.openOverlay();
  }

  private loadDataset(id: string, type: string): void {
    this.showloading();
    const resource = { id, type: parseDatasetType(type) };
    this.datasetSrvc.getDataset(resource).subscribe(
      dataset => {
        if (resource.type === DatasetType.GEOJSON) {
          this.datasetSrvc.getGeoJSON(dataset.url, resource).subscribe(
            geojson => {
              this.mapOptions = new GeoJSONOptions(dataset.url, resource, geojson);
              this.hideLoading();
            },
            error => this.handleError(error)
          );
        }
        if (resource.type === DatasetType.WMS) {
          this.wmsSrvc.getLayerTree(dataset.url, resource).subscribe(
            layerTree => {
              const layerList = this.wmsSrvc.asList(layerTree, []);
              this.mapOptions = new WmsOptions(dataset.url, resource, layerList);
              this.hideLoading();
            },
            error => this.handleError(error)
          );
        }
        if (resource.type === DatasetType.FIWARE) {
          this.mapOptions = new FiwareOptions(dataset.url, resource);
          this.hideLoading();
        }
      },
      error => this.handleError(error)
    );
  }

  private handleError(error: EdpError): void {
    this.hideLoading();
    this.mapOptions = new MapOptions();
    this.errorSrvc.openErrorScreen(error);
  }

  private showloading(): void {
    const config = new OverlayConfig();
    config.positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();
    this.loadingOverlayRef = this.overlay.create(config);
    const loadingPortal = new ComponentPortal(LoadingDatasetComponent);
    this.loadingOverlayRef.attach(loadingPortal);
  }

  private hideLoading(): void {
    this.loadingOverlayRef.dispose();
  }
}
