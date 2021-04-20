import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    @Inject('DEPLOY_URL') private deployUrl: string,
    private translateSrvc: TranslateService,
  ) { }

  public openContact(postfix?: string, lang = this.translateSrvc.currentLang): void {
    let url = `${this.deployUrl}${lang}/feedback/form`;
    if (postfix) {
      url = `${url}?${postfix}`;
    }
    window.open(url, '_target');
  }
}