import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep1Component } from './quiz-creation-step-1.component';

describe('QuizCreationStep1Component', () => {
  let component: QuizCreationStep1Component;
  let fixture: ComponentFixture<QuizCreationStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep1Component],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
