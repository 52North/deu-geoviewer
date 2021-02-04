import { OverlayModule } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TutorialService } from './intro.service';

describe('TutorialService', () => {
  let service: TutorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        OverlayModule
      ]
    });
    service = TestBed.inject(TutorialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
