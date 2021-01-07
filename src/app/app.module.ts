import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Configuration } from './configuration/configuration.model';
import { ConfigurationService } from './configuration/configuration.service';
import { FeatureInfoPopupComponent } from './feature-info-popup/feature-info-popup.component';
import { LinkViewComponent } from './link-view/link-view.component';
import { MapViewComponent } from './map-view/map-view.component';
import { MapComponent } from './map/map.component';

export function loadConfiguration(configService: ConfigurationService): () => Promise<void | Configuration> {
  return () => configService.loadConfiguration();
}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapViewComponent,
    FeatureInfoPopupComponent,
    LinkViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfiguration,
      deps: [ConfigurationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
