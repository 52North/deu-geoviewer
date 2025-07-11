import { Component, OnInit, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterOutlet } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

import { DatasetTitleComponent } from "./components/dataset-title/dataset-title.component";
import { CustomGuidedTourComponent } from "./components/guided-tour/custom-guided-tour.component";
import { LanguageButtonComponent } from "./components/language-overlay-selection/language-button/language-button.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [LanguageButtonComponent, DatasetTitleComponent, RouterOutlet, CustomGuidedTourComponent]
})
export class AppComponent implements OnInit {
  private titleSrvc = inject(Title);
  private translateSrvc = inject(TranslateService);


  ngOnInit(): void {
    this.translateSrvc.onLangChange.subscribe(() => this.setTitle());
    this.setTitle();
  }

  private setTitle(): void {
    this.translateSrvc.get('tagline').subscribe({
      next: t => this.titleSrvc.setTitle(`${t} | data.europa.eu`)
    });
  }

}
