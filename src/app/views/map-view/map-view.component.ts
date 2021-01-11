import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GeoJSONOptions, MapOptions, WmsOptions } from '../../components/map/map.component';
import { NoServiceAvailableComponent } from '../../components/modals/no-service-available/no-service-available.component';
import { DatasetType } from '../../model';
import { DatasetService } from '../../services/dataset.service';
import { WmsService } from './../../services/wms.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

  public mapOptions: MapOptions | undefined;

  constructor(
    private datasetSrvc: DatasetService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private wmsSrvc: WmsService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const datasetId = params.dataset;
      const type = params.type;
      if (datasetId) {
        this.loadDataset(datasetId, type);
      } else {
        this.mapOptions = new MapOptions();
      }
    });
  }

  private loadDataset(id: string, type: string): void {
    this.datasetSrvc.getDataset(id).subscribe(
      dataset => {
        if (dataset.type === DatasetType.GEOJSON) {
          this.datasetSrvc.getGeoJSON(dataset.url).subscribe(
            geojson => {
              this.mapOptions = new GeoJSONOptions(geojson);
            },
            error => this.serviceNoAvailable()
          );
        }
        if (dataset.type === DatasetType.WMS) {
          this.wmsSrvc.getLayerTree(dataset.url).subscribe(layerTree => {
            const layerList = this.wmsSrvc.asList(layerTree, []);
            this.mapOptions = new WmsOptions(layerList);
          });
        }
      },
      error => this.serviceNoAvailable()
    );
  }

  private serviceNoAvailable(): void {
    this.mapOptions = new MapOptions();
    const modalRef = this.modalService.open(NoServiceAvailableComponent, { centered: true });
  }
}
