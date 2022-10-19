import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LangTitle } from '../../model';

@Component({
  selector: 'app-language-label',
  templateUrl: './language-label.component.html',
  styleUrls: ['./language-label.component.scss']
})
export class LanguageLabelComponent implements OnInit, OnChanges {

  @Input() languageList: LangTitle[] | undefined;

  label: string | undefined;

  constructor(
    public translate: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languageList'] && this.languageList) {
      this.adjustLabel();
    }
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(l => this.adjustLabel());
    this.adjustLabel();
  }

  adjustLabel(): void {
    const code = this.translate.currentLang;
    this.label = this.languageList?.find(e => e.code === code)?.title;
    if (!this.label && this.languageList?.length) {
      this.label = this.languageList[0].title;
    }
  }

}
