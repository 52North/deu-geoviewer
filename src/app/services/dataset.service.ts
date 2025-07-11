import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { API_URL, PROXY_URL } from '../../main';
import { ConfigurationService } from '../configuration/configuration.service';
import {
  CkanResource,
  Dataset,
  DatasetType,
  LangTitle,
  TitleInput,
} from '../model';
import {
  NotAvailableError,
  NotSupportedError,
  NotSupportedReason,
} from './error-handling/model';

export interface DistributionResponse {
  '@graph': string;
}
const dcatNS = 'http://wwww.w3.org/ns/dcat#';
const dctNS = 'http://purl.org/dc/terms/';
const dcatPrefix = 'dcat';
const dctPrefix = 'dct';

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  private http = inject(HttpClient);
  private proxyUrl = inject<string>(PROXY_URL);
  private apiUrl = inject<string>(API_URL);
  private config = inject(ConfigurationService);

  getDataset(resource: CkanResource): Observable<Dataset> {
    const url = `${this.apiUrl}distributions/${resource.id}`;
    return this.http
      .get(url, { headers: { accept: 'application/ld+json' } })
      .pipe(
        catchError(err => this.handleError(url, err, resource)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((res: any) => {
          if (!res) {
            throw new NotSupportedError(
              url,
              resource,
              NotSupportedReason.metadata
            );
          }

          let dist;

          if (res['@graph'] && res['@graph'].length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            res['@graph'].forEach((e: any) => {
              if (
                e['@type'] === 'http://www.w3.org/ns/dcat#Distribution' ||
                e['@type'] === 'dcat:Distribution'
              ) {
                dist = e;
              }
            });
          } else {
            dist = res;
          }

          const accessURL =
            dist.accessURL ||
            (dist[`${dcatPrefix}:accessURL`] || dist[`${dcatNS}accessURL`])?.[
              '@id'
            ];
          const downloadURL =
            dist.downloadURL ||
            (dist[`${dcatPrefix}:downloadURL`] ||
              dist[`${dcatNS}downloadURL`])?.['@id'];
          const description =
            dist.description ||
            (dist[`${dctPrefix}:description`] || dist[`${dctNS}description`])?.[
              '@id'
            ];
          const format =
            dist.format ||
            (dist[`${dctPrefix}:format`] || dist[`${dctNS}format`])?.['@id'];
          resource.type = resource.type
            ? resource.type
            : this.getFormat(format);
          if (!resource.type) {
            throw new NotSupportedError(
              url,
              resource,
              NotSupportedReason.fileFormat
            );
          }

          const primaryUrl = downloadURL ? downloadURL : accessURL;
          const dataset: Dataset = {
            resource,
            description,
            title: this.fetchTitle(dist),
            primaryUrl,
          };
          if (accessURL) {
            dataset.secondaryUrl = accessURL;
          }
          return dataset;
        })
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fetchTitle(dist: any): TitleInput {
    if (dist.title) {
      if (typeof dist.title === 'string') {
        return dist.title;
      }
    }
    if (dist[`${dctPrefix}:title`] && dist[`${dctPrefix}:title`]['@value']) {
      if (dist[`${dctPrefix}:title`]['@language']) {
        return [
          {
            code: dist[`${dctPrefix}:title`]['@language'].substring(0, 2),
            title: dist[`${dctPrefix}:title`]['@value'],
          },
        ] as LangTitle[];
      }
      return dist[`${dctPrefix}:title`]['@value'];
    }
    if (Array.isArray(dist.title)) {
      if (dist.title.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const titleLangs = dist.title.map((e: any) => {
          if (typeof e === 'string') {
            const found = dist.title.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (e: any) =>
                typeof e === 'object' &&
                Object.prototype.hasOwnProperty.call(e, '@language') &&
                Object.prototype.hasOwnProperty.call(e, '@value')
            );
            return { code: found['@language'].substring(5, 7), title: e };
          }
          if (
            typeof e === 'object' &&
            Object.prototype.hasOwnProperty.call(e, '@language') &&
            Object.prototype.hasOwnProperty.call(e, '@value')
          ) {
            return { code: e['@language'].substring(0, 2), title: e['@value'] };
          }
          return { code: '' };
        });
        return titleLangs as LangTitle[];
      }
    }
    if (Array.isArray(dist[`${dctPrefix}:title`])) {
      if (dist[`${dctPrefix}:title`].length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const titleLangs = dist[`${dctPrefix}:title`].map((e: any) => {
          if (
            typeof e === 'object' &&
            Object.prototype.hasOwnProperty.call(e, '@language') &&
            Object.prototype.hasOwnProperty.call(e, '@value')
          ) {
            return { code: e['@language'].substring(0, 2), title: e['@value'] };
          }
          return { code: '' };
        });
        return titleLangs as LangTitle[];
      }
    }
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getGeoJSON(url: string, resource: CkanResource): Observable<any> {
    return this.http
      .get(`${this.proxyUrl}${url}`)
      .pipe(catchError(err => this.handleError(url, err, resource)));
  }

  private handleError(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any,
    resource: CkanResource
  ): Observable<never> {
    return throwError(new NotAvailableError(url, resource, err));
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
    if (format.indexOf('fiware') > -1) {
      return DatasetType.FIWARE;
    }
    return undefined;
  }
}
