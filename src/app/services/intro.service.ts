import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GuidedTour, GuidedTourService, Orientation } from 'ngx-guided-tour';
import { first } from 'rxjs/operators';

import { WelcomeScreenService } from '../components/modals/welcome/welcome.component';

const INITIAL_INTRO_DISPLAYED_STORAGE_KEY = 'INITIAL_INTRO_DISPLAYED_STORAGE_KEY';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  constructor(
    private translate: TranslateService,
    private guidedTourService: GuidedTourService,
    private welcomeScreen: WelcomeScreenService
  ) {
    this.welcomeScreen.welcomeScreenClosed.pipe(first()).subscribe(res => this.initionalTutorialDisplay());
  }

  public initionalTutorialDisplay(): void {
    if (localStorage.getItem(INITIAL_INTRO_DISPLAYED_STORAGE_KEY) !== 'true') {
      this.openTutorial();
      localStorage.setItem(INITIAL_INTRO_DISPLAYED_STORAGE_KEY, 'true');
    }
  }

  public openTutorial(): void {
    this.guidedTourService.startTour(this.createTourOptions());
  }

  private createTourOptions(): GuidedTour {
    return {
      tourId: 'purchases-tour',
      useOrb: false,
      preventBackdropFromAdvancing: true,
      steps: [
        {
          content: this.translate.instant('tutorial.step1'),
          orientation: Orientation.Bottom
        },
        {
          content: this.translate.instant('tutorial.step2')
        },
        {
          selector: '.map .zoom-buttons',
          content: this.translate.instant('tutorial.step3'),
          orientation: Orientation.Left,
          highlightPadding: 5
        },
        {
          content: this.translate.instant('tutorial.step4'),
          selector: '.map .feature-buttons',
          orientation: Orientation.Top,
          highlightPadding: 5
        },
        {
          content: this.translate.instant('tutorial.step5'),
          selector: '.map .feature-buttons .legend-button',
          orientation: Orientation.TopLeft,
          highlightPadding: 5
        },
        {
          content: this.translate.instant('tutorial.step6'),
          selector: '.map .feature-buttons .feature-info-button',
          orientation: Orientation.Top,
          highlightPadding: 5
        }
      ]
    };
  }

}


