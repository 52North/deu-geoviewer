import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTitleComponent } from './dataset-title.component';

describe('DatasetTitleComponent', () => {
  let component: DatasetTitleComponent;
  let fixture: ComponentFixture<DatasetTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
