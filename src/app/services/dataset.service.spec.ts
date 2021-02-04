import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { DatasetService } from './dataset.service';

describe('DatasetService', () => {
  let service: DatasetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(DatasetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
