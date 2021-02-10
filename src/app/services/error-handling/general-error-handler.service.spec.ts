import { OverlayModule } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';

import { GeneralErrorHandler } from './general-error-handler.service';

describe('GeneralErrorHandler', () => {
  let service: GeneralErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OverlayModule
      ]
    });
    service = TestBed.inject(GeneralErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
