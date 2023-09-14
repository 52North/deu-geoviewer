import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";

import { LegalDisclaimerComponent } from "./legal-disclaimer.component";

describe('LegalDisclaimerComponent', () => {
  let component: LegalDisclaimerComponent;
  let fixture: ComponentFixture<LegalDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        LegalDisclaimerComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
