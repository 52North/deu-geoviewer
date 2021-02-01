import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Configuration } from './configuration.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private readonly CONFIGURATION_URL = './assets/config/configuration.json';

  configuration!: Configuration;

  constructor(private http: HttpClient) { }

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
