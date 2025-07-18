import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Extent {
  description?: string;
  spatial?: {
    description?: string;
    bbox: number[][];
    crs: string;
  };
}

export interface Link {
  href: string;
  rel?: string;
  type?: string;
  hreflang?: string;
  title?: string;
  length?: number;
}

export interface LandingPage {
  title?: string;
  description?: string;
  extent?: Extent;
  links: Link[];
}

export interface Collection {
  id: string;
  links: Link[];
  title?: string;
  description?: string;
  crs?: string[];
  storageCrsCoordinateEpoch?: number;
  itemType?: string;
  storageCrs?: string;
  extent?: Extent;
}

export interface CollectionResponse {
  title?: string;
  description?: string;
  collections: Collection[];
  crs: string[];
  links: Link[];
}

export interface CollectionItem {
  type: string;
  features: {
    type: string;
    geometry: GeoJSONFeature[];
  };
  links?: Link[];
  timeStamp?: string;
  numberMatched: number;
  numberReturned: number;
}

export interface CollectionItemsQueryOptions {
  limit?: number;
}

export const UNVALID_LANDING_PAGE = 'UNVALID_LANDING_PAGE';

@Injectable({
  providedIn: 'root',
})
export class OGCFeaturesService {
  private httpClient = inject(HttpClient);

  getLandingPage(url: string): Observable<LandingPage> {
    return this.httpClient.get<LandingPage>(url).pipe(
      tap(res => {
        const serviceCheck = res.links.find(
          e => e.rel === 'service-desc' || e.rel === 'service-doc'
        );
        const conformanceCheck = res.links.find(e => e.rel === 'conformance');
        const dataCheck = res.links.find(e => e.rel === 'data');
        if (!serviceCheck || !conformanceCheck || !dataCheck) {
          throw new Error(UNVALID_LANDING_PAGE);
        }
      })
    );
  }

  getCollections(serviceUrl: string): Observable<CollectionResponse> {
    const url = `${serviceUrl}/collections`;
    return this.httpClient.get<CollectionResponse>(url);
  }

  getCollectionItems(
    collection: Collection,
    serviceUrl: string | undefined,
    options?: CollectionItemsQueryOptions
  ) {
    const params = new URLSearchParams();
    if (options?.limit !== undefined) {
      params.append('limit', `${options.limit}`);
    }
    const url = `${serviceUrl}/collections/${collection.id}/items?${params.toString()}`;
    return this.httpClient.get<CollectionItem>(url);
  }

  getCollectionItemsByNextLink(link: Link): Observable<CollectionItem> {
    return this.httpClient.get<CollectionItem>(link.href);
  }
}
