import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationStep3LayoutComponent } from './battle-creation-step-3-layout.component';

describe('BattleCreationStep3LayoutComponent', () => {
  let component: BattleCreationStep3LayoutComponent;
  let fixture: ComponentFixture<BattleCreationStep3LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationStep3LayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
