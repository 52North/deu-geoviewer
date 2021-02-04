import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private config: ConfigurationService,
  ) { }

  ngOnInit(): void {
    this.currentLangCode = this.translate.currentLang;
  }

  public changeLang(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.currentLangCode = code;
    this.translate.use(code);
    this.setLangCodeInUrl(code);
  }

  private setLangCodeInUrl(code: string): void {
    this.route.queryParams.subscribe(res => {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {
          lang: code
        },
        queryParamsHandling: 'merge',
        skipLocationChange: true
      });
    });
  }

}
