import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { ConfigurationService } from "./../../configuration/configuration.service";
import { LanguageSelectorComponent } from "./language-selector.component";
import { translateConfig } from "../../../main";

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot(translateConfig),
        LanguageSelectorComponent],
    providers: [
        {
            provide: ConfigurationService,
            useValue: {
                configuration: {
                    languages: []
                }
            }
        },
        provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
