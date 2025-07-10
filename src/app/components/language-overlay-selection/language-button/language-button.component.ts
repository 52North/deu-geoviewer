import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Component, InjectionToken, Injector, OnInit, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { ConfigurationService } from "../../../configuration/configuration.service";
import { LanguageOverlaySelectionComponent } from "../language-overlay-selection.component";

export interface LanguageOverlayConfig {
  overlayRef: OverlayRef
}
export const CONTAINER_DATA = new InjectionToken<LanguageOverlayConfig>('CONTAINER_DATA');

@Component({
  selector: 'app-language-button',
  templateUrl: './language-button.component.html',
  styleUrls: ['./language-button.component.scss'],
  standalone: true
})
export class LanguageButtonComponent implements OnInit {
  private overlay = inject(Overlay);
  private translate = inject(TranslateService);
  private config = inject(ConfigurationService);
  private injector = inject(Injector);


  public currentCode!: string;
  public currentLang: string | undefined;

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(res => this.setLanguage());
    this.setLanguage();
  }

  private setLanguage() {
    this.currentCode = this.translate.currentLang;
    this.currentLang = this.config.configuration.languages.find(e => e.code === this.currentCode)?.label;
  }

  openOverlay() {
    const overlayRef = this.overlay.create({
      height: '100%',
      width: '100%',
    });
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: CONTAINER_DATA, useValue: { overlayRef } }
      ]
    })
    const userProfilePortal = new ComponentPortal(LanguageOverlaySelectionComponent, null, injector);
    overlayRef.attach(userProfilePortal);
  }
}
