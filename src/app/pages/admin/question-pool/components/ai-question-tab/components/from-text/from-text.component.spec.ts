import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromTextComponent } from './from-text.component';

describe('FromTextComponent', () => {
  let component: FromTextComponent;
  let fixture: ComponentFixture<FromTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FromTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
