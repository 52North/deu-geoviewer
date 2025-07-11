import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { PROXY_URL } from '../../main';
import { NotSupportedError, NotSupportedReason } from './error-handling/model';

@Injectable({
  providedIn: 'root',
})
export class FileLoaderService {
  private http = inject(HttpClient);
  private proxyUrl = inject<string>(PROXY_URL);

  loadFile(fileUrl: string, type: string) {
    switch (type.toLocaleLowerCase()) {
      case 'geojson':
        return this.http.get(`${this.proxyUrl}${fileUrl}`);
      default:
        throw new NotSupportedError(
          fileUrl,
          { id: 'file', type: undefined },
          NotSupportedReason.fileFormat
        );
    }
  }
}
