import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';

const INITIAL_HIDE_DISPLAY_STORAGE_KEY = 'INITIAL_HIDE_DISPLAY_STORAGE_KEY';

@Injectable({
  providedIn: 'root'
})
export class WelcomeScreenService {

  public welcomeScreenClosed: EventEmitter<void> = new EventEmitter();

  constructor(
    private overlay: Overlay
  ) {
    if (!this.shouldInitialHide()) {
      this.openOverlay();
    }
  }

  public openOverlay(): void {
    const config = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true
    });
    const overlayRef = this.overlay.create(config);
    const portal = new ComponentPortal<WelcomeComponent>(WelcomeComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.initialHide = this.shouldInitialHide();
    componentRef.instance.closeScreen.subscribe((initialDisplay: boolean) => this.closeOverlay(overlayRef, initialDisplay));
  }

  private closeOverlay(overlayRef: OverlayRef, initialDisplay: boolean): void {
    localStorage.setItem(INITIAL_HIDE_DISPLAY_STORAGE_KEY, initialDisplay.toString());
    this.welcomeScreenClosed.next();
    this.welcomeScreenClosed.complete();
    return overlayRef.dispose();
  }

  private shouldInitialHide(): boolean {
    return localStorage.getItem(INITIAL_HIDE_DISPLAY_STORAGE_KEY) === 'true';
  }

}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  @Output() public closeScreen: EventEmitter<boolean> = new EventEmitter();

  @Input() public initialHide!: boolean;

  close(): void {
    this.closeScreen.next(this.initialHide);
    this.closeScreen.complete();
  }
}
