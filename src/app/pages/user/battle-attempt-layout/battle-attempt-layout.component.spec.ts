import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleAttemptLayoutComponent } from './battle-attempt-layout.component';

describe('BattleAttemptLayoutComponent', () => {
  let component: BattleAttemptLayoutComponent;
  let fixture: ComponentFixture<BattleAttemptLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleAttemptLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleAttemptLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
