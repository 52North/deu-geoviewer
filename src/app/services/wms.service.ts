import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import WMSCapabilities from "ol/format/WMSCapabilities";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { ConfigurationService } from "../configuration/configuration.service";
import { CkanResource } from "../model";
import { NotAvailableError, NotSupportedError, NotSupportedReason } from "./error-handling/model";

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
  queryable?: boolean;
}

export interface WMSLayer {
  name: string;
  title: string;
  abstract: string;
  url: string;
  bbox: number[];
  queryable: boolean;
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
      list.push({ ...entry });
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
      queryable: layer.queryable === undefined ? true : layer.queryable,
      childLayer: layer.Layer ? layer.Layer.map(l => this.createLayer(l, url)) : []
    };
  }

  private cleanUpWMSUrl(urlStr: string): string {
    const url = new URL(urlStr);
    return url.origin + url.pathname;
  }

  private getCapabilities(url: string, resource: CkanResource): Observable<any> {
    const wmsRequesturl = `${this.proxyUrl}${this.createCapabilitiesUrl(url)}`;
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

  private createCapabilitiesUrl(urlStr: string): string {
    const url = new URL(urlStr);
    const { searchParams } = url;
    if (!searchParams.has("request")) {
      searchParams.set("request", "GetCapabilities");
    }
    if (!searchParams.has("service")) {
      searchParams.set("service", "wms");
    }
    if (!searchParams.has("version")) {
      searchParams.set("version", "1.3.0");
    }
    return url.toString();
  }

  private handleError(url: string, err: any, resource: CkanResource): Observable<never> {
    return throwError(new NotAvailableError(url, resource, err));
  }
}
