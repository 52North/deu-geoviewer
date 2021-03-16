import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { NotAvailableError } from './error-handling/model';
import { ConfigurationService } from '../configuration/configuration.service';
import { CkanResource } from '../model';
import { NotSupportedError, NotSupportedReason } from './error-handling/model';

interface InternalWMSLayer {
  Name: string;
  Title: string;
  Abstract: string;
  Layer: InternalWMSLayer[];
  Dimension: {
    name: string;
    default: string;
    values: string;
  }[];
  BoundingBox: {
    crs: string;
    extent: number[]
  }[];
  Style: {
    Abstract: string;
    Name: string;
    Title: string;
    LegendURL: {
      Format: string;
      OnlineResource: string;
      size: number[];
    }[]
  }[];
  EX_GeographicBoundingBox: number[];
}

export interface WMSLayer {
  name: string;
  title: string;
  abstract: string;
  url: string;
  bbox: number[];
  childLayer?: WMSLayer[];
}

@Injectable({
  providedIn: 'root'
})
export class WmsService {

  constructor(
    private http: HttpClient,
    @Inject('PROXY_URL') private proxyUrl: string,
    private config: ConfigurationService
  ) { }

  public getLayerTree(wmsurl: string, resource: CkanResource): Observable<WMSLayer> {
    return this.getCapabilities(wmsurl, resource).pipe(map(res => this.createLayer(res.Capability.Layer, this.cleanUpWMSUrl(wmsurl))));
  }

  public asList(entry: WMSLayer, list: WMSLayer[]): WMSLayer[] {
    if (entry.name !== undefined) {
      list.push({
        name: entry.name,
        title: entry.title,
        abstract: entry.abstract,
        bbox: entry.bbox,
        url: entry.url
      });
    }
    if (entry.childLayer && entry.childLayer.length > 0) {
      entry.childLayer.forEach(e => this.asList(e, list));
    }
    return list;
  }

  private createLayer(layer: InternalWMSLayer, url: string): WMSLayer {
    return {
      name: layer.Name,
      title: layer.Title,
      abstract: layer.Abstract,
      url,
      bbox: layer.EX_GeographicBoundingBox,
      childLayer: layer.Layer ? layer.Layer.map(l => this.createLayer(l, url)) : []
    };
  }

  private cleanUpWMSUrl(url: string): string {
    let wmsRequesturl = url;
    if (wmsRequesturl.indexOf('?') !== -1) {
      wmsRequesturl = wmsRequesturl.substring(0, wmsRequesturl.indexOf('?'));
    }
    return wmsRequesturl;
  }

  private getCapabilities(url: string, resource: CkanResource): Observable<any> {
    const wmsRequesturl = `${this.proxyUrl}${this.cleanUpWMSUrl(url)}?request=GetCapabilities&service=wms&version=1.3.0`;
    return this.http.get(wmsRequesturl, { responseType: 'text' }).pipe(
      catchError(err => this.handleError(url, err, resource)),
      map(res => {
        try {
          return new WMSCapabilities().read(res);
        } catch (error) {
          throw new NotSupportedError(url, resource, NotSupportedReason.metadata);
        }
      })
    );
  }

  private handleError(url: string, err: any, resource: CkanResource): Observable<never> {
    return throwError(new NotAvailableError(url, resource, err));
  }
}
