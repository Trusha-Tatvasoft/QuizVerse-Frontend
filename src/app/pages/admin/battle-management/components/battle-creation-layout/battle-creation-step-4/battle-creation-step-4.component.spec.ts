import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep4Component } from './battle-creation-step-4.component';

describe('BattleCreationStep4Component', () => {
  let component: BattleCreationStep4Component;
  let fixture: ComponentFixture<BattleCreationStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep4Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
