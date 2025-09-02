import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleRequestComponent } from './battle-request.component';

describe('BattleRequestComponent', () => {
  let component: BattleRequestComponent;
  let fixture: ComponentFixture<BattleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
