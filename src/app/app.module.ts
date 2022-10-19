import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbAccordionModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GuidedTourService, WindowRefService } from 'ngx-guided-tour';

import { environment } from './../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatasetTitleComponent } from './components/dataset-title/dataset-title.component';
import { CustomGuidedTourComponent } from './components/guided-tour/custom-guided-tour.component';
import { InfoOverlayComponent } from './components/info-overlay/info-overlay.component';
import { LanguageLabelComponent } from './components/language-label/language-label.component';
import { LanguageButtonComponent } from './components/language-overlay-selection/language-button/language-button.component';
import {
  LanguageOverlaySelectionComponent,
} from './components/language-overlay-selection/language-overlay-selection.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { CounterComponent } from './components/map/counter/counter.component';
import { FeatureInfoPopupComponent } from './components/map/feature-info-popup/feature-info-popup.component';
import { MapComponent } from './components/map/map.component';
import { WmsFeatureInfoComponent } from './components/map/wms-feature-info/wms-feature-info.component';
import { ErrorComponent } from './components/modals/error/error.component';
import { LegalDisclaimerComponent } from './components/modals/legal-disclaimer/legal-disclaimer.component';
import { LoadingDatasetComponent } from './components/modals/loading-dataset/loading-dataset.component';
import { WelcomeComponent } from './components/modals/welcome/welcome.component';
import { Configuration } from './configuration/configuration.model';
import { ConfigurationService } from './configuration/configuration.service';
import { GeneralErrorHandler as GeneralErrorHandler } from './services/error-handling/general-error-handler.service';
import { LinkViewComponent } from './views/link-view/link-view.component';
import { MapViewComponent } from './views/map-view/map-view.component';

export function initApplication(configService: ConfigurationService, translate: TranslateService): () => Promise<void> {
  return () => configService.loadConfiguration().then((config: Configuration) => {
    let lang = 'en';
    const url = window.location.href;
    const name = 'lang';
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (results && results[2]) {
      const match = config.languages.find(e => e.code === results[2]);
      if (match) { lang = match.code; }
    }
    translate.setDefaultLang(lang);
    return translate.use(lang).toPromise();
  });
}

export const translateConfig = {
  defaultLanguage: 'en',
  loader: {
    provide: TranslateLoader,
    useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
    deps: [HttpClient]
  }
};

@NgModule({
  declarations: [
    AppComponent,
    CounterComponent,
    CustomGuidedTourComponent,
    DatasetTitleComponent,
    ErrorComponent,
    FeatureInfoPopupComponent,
    InfoOverlayComponent,
    LanguageButtonComponent,
    LanguageLabelComponent,
    LanguageOverlaySelectionComponent,
    LanguageSelectorComponent,
    LegalDisclaimerComponent,
    LinkViewComponent,
    LoadingDatasetComponent,
    MapComponent,
    MapViewComponent,
    WelcomeComponent,
    WmsFeatureInfoComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModalModule,
    NgbAccordionModule,
    TranslateModule.forRoot(translateConfig),
    OverlayModule,
  ],
  providers: [
    { provide: 'PROXY_URL', useValue: environment.proxyUrl },
    { provide: 'DEPLOY_URL', useValue: environment.deployUrl },
    { provide: 'API_URL', useValue: environment.apiUrl },
    {
      provide: ErrorHandler,
      useClass: GeneralErrorHandler
    },
    GuidedTourService,
    WindowRefService,
    {
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      deps: [ConfigurationService, TranslateService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
