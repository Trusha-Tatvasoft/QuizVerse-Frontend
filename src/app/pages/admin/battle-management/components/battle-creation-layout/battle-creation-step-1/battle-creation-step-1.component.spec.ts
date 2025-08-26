import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep1Component } from './battle-creation-step-1.component';

describe('BattleCreationStep1Component', () => {
  let component: BattleCreationStep1Component;
  let fixture: ComponentFixture<BattleCreationStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep1Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
