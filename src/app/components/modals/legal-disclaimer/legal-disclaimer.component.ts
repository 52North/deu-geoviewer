import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, Injectable, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LegalDisclaimerService {
  private overlay = inject(Overlay);

  public openOverlay(): void {
    const config = new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });
    const overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal<LegalDisclaimerComponent>(
      LegalDisclaimerComponent
    );
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.overlayRef = overlayRef;
  }
}

@Component({
  selector: 'app-legal-disclaimer',
  templateUrl: './legal-disclaimer.component.html',
  styleUrls: ['./legal-disclaimer.component.scss'],
  imports: [TranslateModule],
})
export class LegalDisclaimerComponent {
  public overlayRef!: OverlayRef;
}
