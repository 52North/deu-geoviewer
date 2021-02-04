import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { NoServiceAvailableComponent } from './no-service-available.component';

describe('NoServiceAvailableComponent', () => {
  let component: NoServiceAvailableComponent;
  let fixture: ComponentFixture<NoServiceAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NoServiceAvailableComponent
      ],
      imports: [
        NgbModalModule
      ],
      providers: [
        NgbActiveModal
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoServiceAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
