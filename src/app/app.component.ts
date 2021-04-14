import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
