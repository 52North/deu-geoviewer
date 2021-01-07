import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

const PROXY_URL = 'https://www.europeandataportal.eu/mapapps-proxy?'; // TODO: add to config

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  constructor(
    private http: HttpClient
  ) { }

  getDataset(datasetId: string, format?: DatasetFormat): Observable<Dataset> {
    return this.http.get(`${PROXY_URL}https://www.europeandataportal.eu/data/api/distributions/${datasetId}`) // TODO: add to config
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
    return this.http.get(`${PROXY_URL}${url}`);
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
