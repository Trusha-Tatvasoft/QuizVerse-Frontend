import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep3Option1Component } from './battle-creation-step-3-option-1.component';

describe('BattleCreationStep3Option1Component', () => {
  let component: BattleCreationStep3Option1Component;
  let fixture: ComponentFixture<BattleCreationStep3Option1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep3Option1Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
