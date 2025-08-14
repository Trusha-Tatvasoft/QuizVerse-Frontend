import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiQuestionTabComponent } from './ai-question-tab.component';

describe('AiQuestionTabComponent', () => {
  let component: AiQuestionTabComponent;
  let fixture: ComponentFixture<AiQuestionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiQuestionTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiQuestionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
