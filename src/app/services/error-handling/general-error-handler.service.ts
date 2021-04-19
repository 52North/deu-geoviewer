import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ErrorHandler, Injectable } from '@angular/core';

import { ErrorComponent } from '../../components/modals/error/error.component';
import { ViewerError } from './model';

@Injectable({
  providedIn: 'root'
})
export class GeneralErrorHandler extends ErrorHandler {

  constructor(
    private overlay: Overlay
  ) {
    super();
  }

  public handleError(error: Error): void {
    if (error instanceof ViewerError) {
      this.openErrorScreen(error);
    } else {
      super.handleError(error);
    }
  }

  public openErrorScreen(error: ViewerError): void {
    const config = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true
    });
    const overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal(ErrorComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.error = error;
    componentRef.instance.overlayRef = overlayRef;
  }
}
