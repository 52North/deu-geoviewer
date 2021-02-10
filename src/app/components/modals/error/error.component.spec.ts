import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { DatasetType } from '../../../model';
import { NotSupportedReason } from '../../../services/error-handling/model';
import { NotSupportedError } from './../../../services/error-handling/model';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ErrorComponent
      ],
      imports: [
        NgbModalModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        NgbActiveModal
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    component.error = new NotSupportedError('url', { id: '123', type: DatasetType.WMS }, NotSupportedReason.crs);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
