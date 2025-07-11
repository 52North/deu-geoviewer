import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { PROXY_URL } from '../../main';
import { WmsService } from './wms.service';

describe('WmsService', () => {
  let service: WmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: PROXY_URL, useValue: "" },
        provideHttpClient(withInterceptorsFromDi()),
    ]
});
    service = TestBed.inject(WmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
