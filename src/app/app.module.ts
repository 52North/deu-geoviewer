import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FeatureInfoPopupComponent } from './components/map/feature-info-popup/feature-info-popup.component';
import { MapComponent } from './components/map/map.component';
import { WmsFeatureInfoComponent } from './components/map/wms-feature-info/wms-feature-info.component';
import { LoadingDatasetComponent } from './components/modals/loading-dataset/loading-dataset.component';
import { NoServiceAvailableComponent } from './components/modals/no-service-available/no-service-available.component';
import { Configuration } from './configuration/configuration.model';
import { ConfigurationService } from './configuration/configuration.service';
import { LinkViewComponent } from './views/link-view/link-view.component';
import { MapViewComponent } from './views/map-view/map-view.component';

export function loadConfiguration(configService: ConfigurationService): () => Promise<void | Configuration> {
  return () => configService.loadConfiguration();
}

@NgModule({
  declarations: [
    AppComponent,
    FeatureInfoPopupComponent,
    LinkViewComponent,
    LoadingDatasetComponent,
    MapComponent,
    MapViewComponent,
    NoServiceAvailableComponent,
    WmsFeatureInfoComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    NgbModule,
    OverlayModule,
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
