import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualQuestionTabComponent } from './manual-question-tab.component';

describe('ManualQuestionTabComponent', () => {
  let component: ManualQuestionTabComponent;
  let fixture: ComponentFixture<ManualQuestionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualQuestionTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManualQuestionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
