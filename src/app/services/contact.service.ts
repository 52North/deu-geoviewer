import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private deployUrl = inject<string>('DEPLOY_URL' as any);
  private translateSrvc = inject(TranslateService);


  public openContact(postfix?: string, lang = this.translateSrvc.currentLang): void {
    let url = `${this.deployUrl}${lang}/feedback/form`;
    if (postfix) {
      url = `${url}?${postfix}`;
    }
    window.open(url, '_target');
  }
}