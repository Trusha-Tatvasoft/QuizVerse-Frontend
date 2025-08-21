import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep3Option2Component } from './quiz-creation-step-3-option-2.component';

describe('QuizCreationStep3Option2Component', () => {
  let component: QuizCreationStep3Option2Component;
  let fixture: ComponentFixture<QuizCreationStep3Option2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep3Option2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3Option2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
