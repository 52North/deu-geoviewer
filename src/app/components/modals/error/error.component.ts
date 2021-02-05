import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, EventEmitter, Injectable, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export class EdpError {
  constructor(
    public url: string,
    public error: any
  ) { }
}

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) { }

  public close: EventEmitter<void> = new EventEmitter();

  public error!: EdpError;

  public requestedUrl: string | undefined;

  public errorMessage: string | undefined;

  ngOnInit(): void {
    if (this.error instanceof EdpError) {
      this.requestedUrl = this.error.url;
      if (this.error.error && this.error.error.status) {

        const translationsKey = `error.httpIssues.${this.error.error.status}`;
        const translation = this.translate.instant(translationsKey);
        if (translationsKey !== translation) {
          this.errorMessage = translation;
          return;
        }
      }
    }
    console.log(this.error);
  }

  public createTicket(): void {
    debugger;
    // TODO: ticket creation
  }
}

@Injectable({
  providedIn: 'root'
})
export class ErrorScreenService {

  constructor(
    private overlay: Overlay
  ) { }

  openErrorScreen(error: EdpError): void {
    const config = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true
    });
    const overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal(ErrorComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.error = error;
    componentRef.instance.close.subscribe(
      undefined,
      undefined,
      () => overlayRef.dispose());
  }

}
