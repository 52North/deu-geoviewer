import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { NotSupportedError, NotSupportedReason } from './error-handling/model';
import { Observable } from 'rxjs';
import { map,  } from 'rxjs/operators';

interface Link {
  href?: string;
  rel?: string;
  type?: string;
  title?: string;
}

interface GeoJSON {
  type: string;
}

function isGeoJSON(object: any): object is GeoJSON {
  return 'type' in object && typeof object.type === 'string';
}

interface Geometry extends GeoJSON {}
interface GeometryCollection extends Geometry {
  type: 'GeometryCollection';
  geometries: Geometry[];
}

function isGeometryCollection(object: any): object is GeometryCollection {
  return isGeoJSON(object) && object.type === 'GeometryCollection';
}
interface Feature extends GeoJSON {
  type: 'Feature';
  properties: { [key: string]: any };
  geometry: Geometry;
}

function newFeature(
  properties: { [key: string]: any },
  geometry: Geometry
): Feature {
  return { type: 'Feature', properties, geometry };
}

function isFeature(object: any): object is Feature {
  return isGeoJSON(object) && object.type === 'Feature';
}

interface FeatureCollection extends GeoJSON {
  type: 'FeatureCollection';
  features: any[];
  links?: Link[];
}

function newFeatureCollection(features: Feature[]): FeatureCollection {
  return { type: 'FeatureCollection', features };
}

function isFeatureCollection(object: any): object is FeatureCollection {
  return isGeoJSON(object) && object.type === 'FeatureCollection';
}

function fetchPaginated<T, R>(
  url: string,
  fetch: (url: string) => Observable<T>,
  nextURL: (response: T) => string | null,
  merge: (responses: T[]) => R
): Observable<R> {
  return new Observable((observer) => {
    fetch(url).subscribe({
      next: (initialResponse) => {
        const next = nextURL(initialResponse);
        if (!next) {
          observer.next(merge([initialResponse]));
          observer.complete();
          return;
        }
        const responses$ = new Observable<T>((o) => {
          const subscriber = {
            next: (value?: any) => {
              o.next(value);
              const url = nextURL(value);
              if (!url) {
                o.complete();
              } else {
                fetch(url).subscribe(subscriber);
              }
            },
            error: (error?: any) => o.error(error),
            complete: () => {},
          };
          fetch(next).subscribe(subscriber);
        });
        const responses: T[] = [initialResponse];
        responses$.subscribe({
          next: (value) => responses.push(value),
          error: (error) => observer.error(error),
          complete: () => {
            observer.next(merge(responses));
            observer.complete();
          },
        });
      },
      error: (error) => {
        observer.error(error);
        observer.complete();
      },
      complete: () => {},
    });
  });
}

@Injectable({
  providedIn: 'root',
})
export class FileLoaderService {
  constructor(
    private http: HttpClient,
    @Inject('PROXY_URL') private proxyUrl: string
  ) {}

  getNextUrl(value: FeatureCollection): string | null {
    const mimeType = 'application/geo+json';
    const relType = 'next';
    if ('links' in value && Array.isArray(value['links'])) {
      const links = value.links;
      for (const link of links) {
        if ('rel' in link && 'type' in link && 'href' in link) {
          const { rel, type, href } = link;
          if (
            rel === relType &&
            type === mimeType &&
            typeof href === 'string'
          ) {
            return href;
          }
        }
      }
    }
    return null;
  }

  mergeFeatureCollections(collections: FeatureCollection[]): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: collections.reduce<any[]>((features, response) => {
        features.push(...response.features);
        return features;
      }, []),
    };
  }
  
  toFeatureCollection(geojson: GeoJSON): FeatureCollection {
    if (isFeatureCollection(geojson)) {
      return geojson;
    } else if (isFeature(geojson)) {
      return newFeatureCollection([geojson]);
    } else if (isGeometryCollection(geojson)) {
      return newFeatureCollection(
        geojson.geometries.map((geometry) => newFeature({}, geometry))
      );
    } else {
      return newFeatureCollection([newFeature({}, geojson)]);
    }
  }

  fetchFeatureCollection(url: string): Observable<FeatureCollection> {
    return this.http.get<GeoJSON>(`${this.proxyUrl}${url}`).pipe(
      map((geojson) => {
        if (!isGeoJSON(geojson)) {
          throw new Error('invalid GeoJSON');
        }
        return this.toFeatureCollection(geojson);
      })
    );
  }

  loadGeoJSON(initialUrl: string) {
    return fetchPaginated<FeatureCollection, FeatureCollection>(
      initialUrl,
      this.fetchFeatureCollection.bind(this),
      this.getNextUrl.bind(this),
      this.mergeFeatureCollections.bind(this)
    );
  }

  loadFile(fileUrl: string, type: string) {
    switch (type.toLocaleLowerCase()) {
      case 'geojson':
        return this.loadGeoJSON(fileUrl);
      default:
        throw new NotSupportedError(
          fileUrl,
          { id: 'file', type: undefined },
          NotSupportedReason.fileFormat
        );
    }
  }
}
