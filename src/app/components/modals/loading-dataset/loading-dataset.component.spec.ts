import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDatasetComponent } from './loading-dataset.component';

describe('LoadingDatasetComponent', () => {
  let component: LoadingDatasetComponent;
  let fixture: ComponentFixture<LoadingDatasetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingDatasetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
