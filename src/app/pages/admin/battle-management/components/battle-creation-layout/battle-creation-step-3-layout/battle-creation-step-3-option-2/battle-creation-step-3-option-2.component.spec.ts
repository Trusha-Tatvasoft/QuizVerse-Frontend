import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep3Option2Component } from './battle-creation-step-3-option-2.component';

describe('BattleCreationStep3Option2Component', () => {
  let component: BattleCreationStep3Option2Component;
  let fixture: ComponentFixture<BattleCreationStep3Option2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep3Option2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
