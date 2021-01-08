import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoServiceAvailableComponent } from './no-service-available.component';

describe('NoServiceAvailableComponent', () => {
  let component: NoServiceAvailableComponent;
  let fixture: ComponentFixture<NoServiceAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoServiceAvailableComponent ]
    })
    .compileComponents();
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
