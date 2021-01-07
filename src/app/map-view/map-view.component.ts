import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DatasetService } from '../dataset.service';
import { GeoJSONOptions, MapOptions } from '../map/map.component';
import { DatasetFormat } from '../model';

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
    // TODO: parse type
    this.datasetSrvc.getDataset(id).subscribe(
      dataset => {
        if (dataset.format === DatasetFormat.GEOJSON) {
          this.datasetSrvc.getGeoJSON(dataset.url).subscribe(
            geojson => {
              this.mapOptions = new GeoJSONOptions(geojson);
            },
            error => {
              // TODO: handle error
            }
          );
        }
      },
      error => {
        // TODO: handle error
      }
    );
  }
}
