import { Component, OnInit } from '@angular/core';

import { DatasetService } from '../dataset.service';
import { GeoJSONOptions, MapOptions } from '../map/map.component';
import { DatasetFormat } from './../dataset.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {

  public mapOptions: MapOptions | undefined;

  constructor(
    private datasetSrvc: DatasetService
  ) { }

  ngOnInit(): void {
    // const id = 'a20be84f-375a-4dc6-9e6f-67dd4d84883e'; // WMS
    // const id = '124f8cb6-3d36-434a-a1a3-7022e380a7a6' // geoJSON
    const id = '9ff99ed4-a4fd-4cbd-863a-6cab5ae168e8'
    this.datasetSrvc.getDataset(id).subscribe(dataset => {
      console.log(dataset);
      if (dataset.format === DatasetFormat.GEOJSON) {
        this.datasetSrvc.getGeoJSON(dataset.url).subscribe(geojson => {
          this.mapOptions = new GeoJSONOptions(geojson);
        })
      }
    })
  }

}
