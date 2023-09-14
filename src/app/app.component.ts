import { Component, OnInit } from "@angular/core";
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
  standalone: true,
  imports: [LanguageButtonComponent, DatasetTitleComponent, RouterOutlet, CustomGuidedTourComponent]
})
export class AppComponent implements OnInit {

  constructor(
    private titleSrvc: Title,
    private translateSrvc: TranslateService
  ) { }

  ngOnInit(): void {
    this.translateSrvc.onLangChange.subscribe(lang => this.setTitle());
    this.setTitle();
  }

  private setTitle(): void {
    this.translateSrvc.get('tagline').subscribe({
      next: t => this.titleSrvc.setTitle(`${t} | data.europa.eu`)
    });
  }

}
