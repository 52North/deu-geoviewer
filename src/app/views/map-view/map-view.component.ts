import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DatasetTitleService } from '../../components/dataset-title/dataset-title.component';
import { GeoJSONOptions, MapOptions, WmsOptions } from '../../components/map/maphandler/model';
import { LegalDisclaimerService } from '../../components/modals/legal-disclaimer/legal-disclaimer.component';
import { LoadingDatasetComponent } from '../../components/modals/loading-dataset/loading-dataset.component';
import { DatasetType, parseDatasetType } from '../../model';
import { DatasetService } from '../../services/dataset.service';
import { GeneralErrorHandler } from '../../services/error-handling/general-error-handler.service';
import { ViewerError } from '../../services/error-handling/model';
import { FileLoaderService } from '../../services/file-loader.service';
import { FiwareOptions } from './../../components/map/maphandler/model';
import { WelcomeScreenService } from './../../components/modals/welcome/welcome.component';
import { ContactService } from './../../services/contact.service';
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
    private datasetTitleSrvc: DatasetTitleService,
    private contactSrvc: ContactService,
    private fileLoader: FileLoaderService,
    public overlay: Overlay
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const distributionId = params.distribution;
    const type = params.type;
    const file = params.file;
    if (file && type) {
      this.loadFile(file, type);
    } else if (distributionId) {
      this.loadDistribution(distributionId, type);
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

  public openContactPage(): void {
    this.contactSrvc.openContact();
  }

  private loadDistribution(id: string, type: string): void {
    this.showloading();
    const resource = { id, type: parseDatasetType(type) };
    this.datasetSrvc.getDataset(resource).subscribe(
      dataset => {
        if (dataset.title) {
          this.datasetTitleSrvc.title.next(dataset.title);
        }
        if (resource.type === DatasetType.GEOJSON) {
          this.datasetSrvc.getGeoJSON(dataset.primaryUrl, resource).subscribe(
            geojson => {
              this.mapOptions = new GeoJSONOptions(dataset.primaryUrl, resource, geojson);
              this.hideLoading();
            },
            error => this.handleError(error)
          );
        }
        if (resource.type === DatasetType.WMS) {
          this.wmsSrvc.getLayerTree(dataset.primaryUrl, resource).subscribe(
            layerTree => {
              const layerList = this.wmsSrvc.asList(layerTree, []);
              this.mapOptions = new WmsOptions(dataset.primaryUrl, resource, layerList);
              this.hideLoading();
            },
            errorPrimary => {
              if (dataset.secondaryUrl) {
                this.wmsSrvc.getLayerTree(dataset.secondaryUrl, resource).subscribe(
                  layerTree => {
                    const layerList = this.wmsSrvc.asList(layerTree, []);
                    this.mapOptions = new WmsOptions(dataset.primaryUrl, resource, layerList);
                    this.hideLoading();
                  },
                  errorSecondary => this.handleError(errorSecondary)
                );
              } else {
                this.handleError(errorPrimary);
              }
            }
          );
        }
        if (resource.type === DatasetType.FIWARE) {
          this.mapOptions = new FiwareOptions(dataset.primaryUrl, resource);
          this.hideLoading();
        }
      },
      error => this.handleError(error)
    );
  }

  private loadFile(fileUrl: string, type: string) {
    this.showloading()
    this.fileLoader.loadFile(fileUrl, type).subscribe({
      next: res => {
        this.mapOptions = new GeoJSONOptions(fileUrl, { id: 'bla', type: DatasetType.GEOJSON }, res);
        this.hideLoading();
      },
      error: err => {
        this.handleError(err);
      }
    });
  }

  private handleError(error: ViewerError): void {
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
