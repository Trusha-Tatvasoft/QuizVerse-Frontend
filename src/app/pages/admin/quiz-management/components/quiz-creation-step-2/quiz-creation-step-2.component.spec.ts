import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep2Component } from './quiz-creation-step-2.component';

describe('QuizCreationStep2Component', () => {
  let component: QuizCreationStep2Component;
  let fixture: ComponentFixture<QuizCreationStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
