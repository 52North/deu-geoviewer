import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Configuration } from './configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private http = inject(HttpClient);


  private readonly CONFIGURATION_URL = './assets/config/configuration.json';

  configuration!: Configuration;

  loadConfiguration(): Promise<Configuration> {
    return this.http
      .get<Configuration>(this.CONFIGURATION_URL)
      .toPromise()
      .then((configuration: Configuration) => {
        this.configuration = configuration;
        return configuration;
      });
  }

}
