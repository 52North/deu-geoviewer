import { Component, OnChanges, OnInit, SimpleChanges, inject, input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { LangTitle } from "../../model";

@Component({
  selector: 'app-language-label',
  templateUrl: './language-label.component.html',
  styleUrls: ['./language-label.component.scss'],
  standalone: true
})
export class LanguageLabelComponent implements OnInit, OnChanges {
  translate = inject(TranslateService);


  readonly languageList = input<LangTitle[]>();

  label: string | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languageList'] && this.languageList()) {
      this.adjustLabel();
    }
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => this.adjustLabel());
    this.adjustLabel();
  }

  adjustLabel(): void {
    const code = this.translate.currentLang;
    const languageList = this.languageList();
    this.label = languageList?.find(e => e.code === code)?.title;
    if (!this.label && languageList?.length) {
      this.label = languageList[0].title;
    }
  }

}
