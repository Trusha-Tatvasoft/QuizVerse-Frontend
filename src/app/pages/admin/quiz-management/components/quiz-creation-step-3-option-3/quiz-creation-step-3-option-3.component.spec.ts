import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep3Option3Component } from './quiz-creation-step-3-option-3.component';

describe('QuizCreationStep3Option3Component', () => {
  let component: QuizCreationStep3Option3Component;
  let fixture: ComponentFixture<QuizCreationStep3Option3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep3Option3Component],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep3Option3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
