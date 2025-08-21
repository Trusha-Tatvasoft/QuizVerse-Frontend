import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep2Component } from './battle-creation-step-2.component';

describe('BattleCreationStep2Component', () => {
  let component: BattleCreationStep2Component;
  let fixture: ComponentFixture<BattleCreationStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
