import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigurationService } from './configuration/configuration.service';

export interface Dataset {
  title: string;
  description: string;
  id: string;
  url: string;
  format: DatasetFormat;
}

export enum DatasetFormat {
  WMS = 'WMS',
  GEOJSON = 'GEOJSON'
}

export interface DistributionResponse {
  '@graph': string;
}

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  constructor(
    private http: HttpClient,
    private config: ConfigurationService
  ) { }

  getDataset(datasetId: string, format?: DatasetFormat): Observable<Dataset> {
    return this.http.get(`${this.config.configuration.proxyUrl}${this.config.configuration.apiUrl}distributions/${datasetId}`)
      .pipe(map((res: any) => {
        if (!res || !res['@graph'] || res['@graph'].length === 0) {
          throw new Error('empty CKAN response');
        }

        let dist: any;
        res['@graph'].forEach((e: any) => {
          if (e['@type'] === 'http://www.w3.org/ns/dcat#Distribution') {
            dist = e;
          }
        });

        const dsFormat = format ? format : this.identifyFormat(dist.format);
        return {
          id: datasetId,
          format: dsFormat,
          description: dist.description,
          title: dist.title,
          url: dist.accessURL
        };
      }));
  }

  getGeoJSON(url: string): Observable<any> {
    return this.http.get(`${this.config.configuration.proxyUrl}${url}`);
  }

  private identifyFormat(format: string): DatasetFormat {
    format = format.toLowerCase();
    if (format.indexOf('geojson') > -1) {
      return DatasetFormat.GEOJSON;
    }
    if (format.indexOf('wms') > -1) {
      return DatasetFormat.WMS;
    }
    throw new Error(`Couldn't find supported format`);
  }

}
