import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigurationService } from '../configuration/configuration.service';
import { Dataset, DatasetType as DatasetType } from '../model';

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

  getDataset(datasetId: string, format?: DatasetType): Observable<Dataset> {
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

        const dsFormat = format ? format : this.getFormat(dist.format);
        return {
          id: datasetId,
          type: dsFormat,
          description: dist.description,
          title: dist.title,
          url: dist.accessURL
        };
      }));
  }

  getGeoJSON(url: string): Observable<any> {
    return this.http.get(`${this.config.configuration.proxyUrl}${url}`);
  }

  private getFormat(format: string | string[]): DatasetType {
    let type: DatasetType | undefined;
    if (Array.isArray(format)) {
      type = format.map(e => this.identifyFormat(e)).find(e => e !== undefined);
    } else {
      type = this.identifyFormat(format);
    }
    if (type) {
      return type;
    } else {
      throw new Error(`Couldn't find supported format`);
    }
  }

  private identifyFormat(format: string): DatasetType | undefined {
    format = format.toLowerCase();
    if (format.indexOf('geojson') > -1) {
      return DatasetType.GEOJSON;
    }
    if (format.indexOf('wms') > -1) {
      return DatasetType.WMS;
    }
    return undefined;
  }

}