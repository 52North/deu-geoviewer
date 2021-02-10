import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LegalDisclaimerService {

  constructor(
    private overlay: Overlay
  ) { }

  public openOverlay(): void {
    const config = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true
    });
    const overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal<LegalDisclaimerComponent>(LegalDisclaimerComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.overlayRef = overlayRef;
  }
}

@Component({
  selector: 'app-legal-disclaimer',
  templateUrl: './legal-disclaimer.component.html',
  styleUrls: ['./legal-disclaimer.component.scss']
})
export class LegalDisclaimerComponent {

  public overlayRef!: OverlayRef;

}
