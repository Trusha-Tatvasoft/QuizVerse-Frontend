import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep3Option3Component } from './battle-creation-step-3-option-3.component';

describe('BattleCreationStep3Option3Component', () => {
  let component: BattleCreationStep3Option3Component;
  let fixture: ComponentFixture<BattleCreationStep3Option3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep3Option3Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
