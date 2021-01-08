import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureInfoPopupComponent } from './feature-info-popup.component';

describe('FeatureInfoPopupComponent', () => {
  let component: FeatureInfoPopupComponent;
  let fixture: ComponentFixture<FeatureInfoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureInfoPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureInfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
