import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { API_URL, PROXY_URL } from '../../main';
import { DatasetService } from './dataset.service';

describe('DatasetService', () => {
  let service: DatasetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: PROXY_URL, useValue: '' },
        { provide: API_URL, useValue: '' },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    });
    service = TestBed.inject(DatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
