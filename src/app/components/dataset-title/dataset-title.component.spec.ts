import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DatasetTitleComponent } from './dataset-title.component';

describe('DatasetTitleComponent', () => {
  let component: DatasetTitleComponent;
  let fixture: ComponentFixture<DatasetTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetTitleComponent, TranslateModule.forRoot()],
    }).compileComponents();
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
