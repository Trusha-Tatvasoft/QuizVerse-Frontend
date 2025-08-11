import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromWebPageComponent } from './from-web-page.component';

describe('FromWebPageComponent', () => {
  let component: FromWebPageComponent;
  let fixture: ComponentFixture<FromWebPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromWebPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FromWebPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
