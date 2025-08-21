import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleCreationLayoutComponent } from './battle-creation-layout.component';

describe('BattleCreationLayoutComponent', () => {
  let component: BattleCreationLayoutComponent;
  let fixture: ComponentFixture<BattleCreationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleCreationLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
