import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleInstructionComponent } from './battle-instruction.component';

describe('BattleInstructionComponent', () => {
  let component: BattleInstructionComponent;
  let fixture: ComponentFixture<BattleInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleInstructionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
