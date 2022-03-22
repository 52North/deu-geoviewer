import { Component, Injectable, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { TitleInput } from '../../model';

@Injectable({
  providedIn: 'root'
})
export class DatasetTitleService {
  public title: Subject<TitleInput> = new Subject();
}

@Component({
  selector: 'app-dataset-title',
  templateUrl: './dataset-title.component.html',
  styleUrls: ['./dataset-title.component.scss']
})
export class DatasetTitleComponent implements OnInit {

  title: string | undefined;

  input: TitleInput | undefined;

  constructor(
    public titleSrvc: DatasetTitleService,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.titleSrvc.title.subscribe(res => this.setTitle(res));
    this.translate.onLangChange.subscribe(l => this.updateTitle());
  }

  setTitle(res: TitleInput) {
    this.input = res;
    this.updateTitle();
  }

  updateTitle(): void {
    if (typeof this.input === 'string') {
      this.title = this.input;
    } else {
      const code = this.translate.currentLang;
      const match = this.input?.find(e => e.code === code);
      this.title = match?.title;
    }
  }

}

