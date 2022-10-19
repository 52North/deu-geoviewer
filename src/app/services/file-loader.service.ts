import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { NotSupportedError, NotSupportedReason } from './error-handling/model';

@Injectable({
  providedIn: 'root'
})
export class FileLoaderService {

  constructor(
    private http: HttpClient,
    @Inject('PROXY_URL') private proxyUrl: string,
  ) { }

  loadFile(fileUrl: string, type: string) {
    switch (type.toLocaleLowerCase()) {
      case 'geojson':
        return this.http.get(`${this.proxyUrl}${fileUrl}`)
      default:
        throw new NotSupportedError(fileUrl, { id: 'file', type: undefined }, NotSupportedReason.fileFormat);
    }
  }

}
