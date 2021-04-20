import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ViewerError } from '../../../services/error-handling/model';
import { ContactService } from './../../../services/contact.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  public overlayRef!: OverlayRef;

  public error!: ViewerError;

  public errorMessage: string | undefined;

  constructor(
    private translate: TranslateService,
    private contactSrvc: ContactService
  ) { }

  ngOnInit(): void {
    if (this.error instanceof ViewerError) {
      const translationsKey = this.error.messageKey;
      const translation = this.translate.instant(translationsKey);
      if (translationsKey !== translation) {
        this.errorMessage = translation;
      }
    }
    console.log(this.error);
  }

  public createTicket(): void {
    this.translate.getTranslation('en').subscribe(translation => {
      this.contactSrvc.openContact(this.error.createTicket(translation), 'en');
    });
  }

}
