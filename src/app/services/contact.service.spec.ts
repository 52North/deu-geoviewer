import { TestBed } from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";

import { DEPLOY_URL } from "../../main";
import { ContactService } from "./contact.service";

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: DEPLOY_URL, useValue: "" },
      ]
    });
    service = TestBed.inject(ContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
