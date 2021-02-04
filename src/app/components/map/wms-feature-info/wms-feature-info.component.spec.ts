import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WmsFeatureInfoComponent } from './wms-feature-info.component';

describe('WmsFeatureInfoComponent', () => {
  let component: WmsFeatureInfoComponent;
  let fixture: ComponentFixture<WmsFeatureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        WmsFeatureInfoComponent
      ],
      imports: [
        HttpClientModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WmsFeatureInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
