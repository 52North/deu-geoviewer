import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ConfigurationService } from '../../configuration/configuration.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {

  public languages = this.config.configuration.languages;
  public currentLangCode!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private config: ConfigurationService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => this.setCurrentLang(params));
  }

  public changeLang(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.currentLangCode = code;
    this.translate.use(code);

    this.route.queryParams.subscribe(res => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          lang: code
        },
        queryParamsHandling: 'merge',
        skipLocationChange: false
      });
    });
  }

  private setCurrentLang(params: Params): void {
    if (params.lang) {
      const match = this.languages.find(e => e.code === params.lang);
      if (match) {
        this.currentLangCode = match.code;
        this.translate.use(match.code);
      }
    }
    this.currentLangCode = this.translate.currentLang || this.translate.getDefaultLang();
  }

}
