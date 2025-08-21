import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep3LayoutComponent } from './quiz-creation-step-3-layout.component';

describe('QuizCreationStep3LayoutComponent', () => {
  let component: QuizCreationStep3LayoutComponent;
  let fixture: ComponentFixture<QuizCreationStep3LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep3LayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
