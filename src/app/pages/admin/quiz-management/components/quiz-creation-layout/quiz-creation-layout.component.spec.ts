import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCreationLayoutComponent } from './quiz-creation-layout.component';

describe('QuizCreationLayoutComponent', () => {
  let component: QuizCreationLayoutComponent;
  let fixture: ComponentFixture<QuizCreationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCreationLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizCreationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
