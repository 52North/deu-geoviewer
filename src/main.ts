/// <reference types="@angular/localize" />
import { OverlayModule } from "@angular/cdk/overlay";
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { enableProdMode, ErrorHandler, importProvidersFrom, inject, provideAppInitializer } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { bootstrapApplication, BrowserModule } from "@angular/platform-browser";
import { NgbAccordionModule, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { GuidedTourService, WindowRefService } from "ngx-guided-tour";

import { AppRoutingModule } from "./app/app-routing.module";
import { AppComponent } from "./app/app.component";
import { Configuration } from "./app/configuration/configuration.model";
import { ConfigurationService } from "./app/configuration/configuration.service";
import { GeneralErrorHandler as GeneralErrorHandler } from "./app/services/error-handling/general-error-handler.service";
import { environment } from "./environments/environment";

if (environment.production) {
    enableProdMode();
}

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

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AppRoutingModule, BrowserModule, FormsModule, NgbModalModule, NgbAccordionModule, TranslateModule.forRoot(translateConfig), OverlayModule),
        { provide: 'PROXY_URL', useValue: environment.proxyUrl },
        { provide: 'DEPLOY_URL', useValue: environment.deployUrl },
        { provide: 'API_URL', useValue: environment.apiUrl },
        {
            provide: ErrorHandler,
            useClass: GeneralErrorHandler
        },
        GuidedTourService,
        WindowRefService,
        provideAppInitializer(() => {
        const initializerFn = (initApplication)(inject(ConfigurationService), inject(TranslateService));
        return initializerFn();
      }),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch(err => console.error(err));
