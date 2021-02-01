import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import introJs from 'intro.js';
import { first } from 'rxjs/operators';

import { WelcomeScreenService } from '../components/modals/welcome/welcome.component';

const INITIAL_INTRO_DISPLAYED_STORAGE_KEY = 'INITIAL_INTRO_DISPLAYED_STORAGE_KEY';

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  private introConfig: introJs.Options = {
    exitOnOverlayClick: false,
    steps: [
      {
        intro: this.translate.instant('tutorial.step1'),
      },
      {
        intro: this.translate.instant('tutorial.step2'),
      },
      {
        intro: this.translate.instant('tutorial.step3'),
        element: '.map .zoom-buttons'
      },
      {
        intro: this.translate.instant('tutorial.step4'),
        element: '.map .feature-buttons'
      },
      {
        intro: this.translate.instant('tutorial.step5'),
        element: '.map .feature-buttons .legend-button'
      },
      {
        intro: this.translate.instant('tutorial.step6'),
        element: '.map .feature-buttons .feature-info-button'
      }
    ]
  };

  constructor(
    private translate: TranslateService,
    private welcomeScreen: WelcomeScreenService
  ) {
    this.welcomeScreen.welcomeScreenClosed.pipe(first()).subscribe(res => this.initionalIntroDisplay());
  }

  public initionalIntroDisplay(): void {
    if (localStorage.getItem(INITIAL_INTRO_DISPLAYED_STORAGE_KEY) !== 'true') {
      this.openIntro();
      localStorage.setItem(INITIAL_INTRO_DISPLAYED_STORAGE_KEY, 'true');
    }
  }

  public openIntro(): void {
    introJs()
      .onafterchange(() => {
        document.querySelectorAll('.introjs-button').forEach(e => {
          e.classList.add('btn');
          e.classList.add('btn-light');
          return e.classList.remove('introjs-button');
        });
      })
      .setOptions(this.introConfig)
      .start();
  }
}
