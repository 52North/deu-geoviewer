/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FileLoaderService } from './file-loader.service';

describe('Service: FileLoader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileLoaderService]
    });
  });

  it('should ...', inject([FileLoaderService], (service: FileLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
