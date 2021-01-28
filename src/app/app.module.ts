import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { FeatureInfoPopupComponent } from './components/map/feature-info-popup/feature-info-popup.component';
import { MapComponent } from './components/map/map.component';
import { WmsFeatureInfoComponent } from './components/map/wms-feature-info/wms-feature-info.component';
import { LoadingDatasetComponent } from './components/modals/loading-dataset/loading-dataset.component';
import { NoServiceAvailableComponent } from './components/modals/no-service-available/no-service-available.component';
import { WelcomeComponent } from './components/modals/welcome/welcome.component';
import { Configuration } from './configuration/configuration.model';
import { ConfigurationService } from './configuration/configuration.service';
import { LinkViewComponent } from './views/link-view/link-view.component';
import { MapViewComponent } from './views/map-view/map-view.component';

export function loadConfiguration(configService: ConfigurationService): () => Promise<void | Configuration> {
  return () => configService.loadConfiguration();
}

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    FeatureInfoPopupComponent,
    LanguageSelectorComponent,
    LinkViewComponent,
    LoadingDatasetComponent,
    MapComponent,
    MapViewComponent,
    NoServiceAvailableComponent,
    WelcomeComponent,
    WmsFeatureInfoComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
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
