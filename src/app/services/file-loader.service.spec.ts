/* tslint:disable:no-unused-variable */
import { HttpClient, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";

import { FileLoaderService } from "./file-loader.service";


describe('Service: FileLoader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileLoaderService,
        HttpClient,
        HttpHandler,
        { provide: 'PROXY_URL', useValue: "" },
      ],
    });
  });

  it('should ...', inject([FileLoaderService], (service: FileLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
