import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationStep4Component } from './quiz-creation-step-4.component';

describe('QuizCreationStep4Component', () => {
  let component: QuizCreationStep4Component;
  let fixture: ComponentFixture<QuizCreationStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationStep4Component],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
