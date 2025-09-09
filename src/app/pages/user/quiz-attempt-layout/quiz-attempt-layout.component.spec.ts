import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAttemptLayoutComponent } from './quiz-attempt-layout.component';

describe('QuizAttemptLayoutComponent', () => {
  let component: QuizAttemptLayoutComponent;
  let fixture: ComponentFixture<QuizAttemptLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAttemptLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAttemptLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
