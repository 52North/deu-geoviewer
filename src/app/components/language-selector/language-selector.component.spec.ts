import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { translateConfig } from "../../app.module";
import { ConfigurationService } from "./../../configuration/configuration.service";
import { LanguageSelectorComponent } from "./language-selector.component";

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        TranslateModule.forRoot(translateConfig),
        HttpClientModule,
        LanguageSelectorComponent
      ],
      providers: [
        {
          provide: ConfigurationService,
          useValue: {
            configuration: {
              languages: []
            }
          }
        }
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
