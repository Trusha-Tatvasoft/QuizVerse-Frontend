import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleQuestionComponent } from './battle-question.component';

describe('BattleQuestionComponent', () => {
  let component: BattleQuestionComponent;
  let fixture: ComponentFixture<BattleQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleQuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
