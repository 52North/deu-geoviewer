import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { WmsService } from './wms.service';

describe('WmsService', () => {
  let service: WmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(WmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
