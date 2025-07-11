import { NgClass } from '@angular/common';
import { Component, Injector, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { LanguageConfig } from './../../configuration/configuration.model';
import { ConfigurationService } from './../../configuration/configuration.service';
import {
  CONTAINER_DATA,
  LanguageOverlayConfig,
} from './language-button/language-button.component';

@Component({
  selector: 'app-language-overlay-selection',
  templateUrl: './language-overlay-selection.component.html',
  styleUrls: ['./language-overlay-selection.component.scss'],
  imports: [NgClass],
})
export class LanguageOverlaySelectionComponent implements OnInit {
  private inj = inject(Injector);
  private config = inject(ConfigurationService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private data: LanguageOverlayConfig | undefined;
  public languages = this.config.configuration.languages;
  public currentLangCode: string | undefined;

  ngOnInit() {
    this.data = this.inj.get(CONTAINER_DATA);
    this.currentLangCode = this.translate.currentLang;
  }

  close() {
    this.data?.overlayRef.dispose();
  }

  selectLanguage(lang: LanguageConfig) {
    this.translate.use(lang.code);
    this.setLangCodeInUrl(lang.code);
    this.close();
  }

  private setLangCodeInUrl(code: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        lang: code,
      },
      queryParamsHandling: 'merge',
    });
  }
}
