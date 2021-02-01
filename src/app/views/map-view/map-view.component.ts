import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GeoJSONOptions, MapOptions, WmsOptions } from '../../components/map/map.component';
import { LoadingDatasetComponent } from '../../components/modals/loading-dataset/loading-dataset.component';
import { NoServiceAvailableComponent } from '../../components/modals/no-service-available/no-service-available.component';
import { DatasetType, parseDatasetType } from '../../model';
import { DatasetService } from '../../services/dataset.service';
import { WelcomeScreenService } from './../../components/modals/welcome/welcome.component';
import { IntroService } from './../../services/intro.service';
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
    private modalService: NgbModal,
    private wmsSrvc: WmsService,
    private welcomeSrvc: WelcomeScreenService,
    private introSrvc: IntroService,
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

  public openIntro(): void {
    this.introSrvc.openIntro();
  }

  private loadDataset(id: string, type: string): void {
    this.showloading();
    const dsType = parseDatasetType(type);
    this.datasetSrvc.getDataset(id, dsType).subscribe(
      dataset => {
        if (dataset.type === DatasetType.GEOJSON) {
          this.datasetSrvc.getGeoJSON(dataset.url).subscribe(
            geojson => {
              this.mapOptions = new GeoJSONOptions(geojson);
              this.hideLoading();
            },
            error => this.serviceNoAvailable()
          );
        }
        if (dataset.type === DatasetType.WMS) {
          this.wmsSrvc.getLayerTree(dataset.url).subscribe(
            layerTree => {
              const layerList = this.wmsSrvc.asList(layerTree, []);
              this.mapOptions = new WmsOptions(layerList);
              this.hideLoading();
            },
            error => this.serviceNoAvailable()
          );
        }
      },
      error => this.serviceNoAvailable()
    );
  }

  private serviceNoAvailable(): void {
    this.hideLoading();
    this.mapOptions = new MapOptions();
    const modalRef = this.modalService.open(NoServiceAvailableComponent, { centered: true });
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
