import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankProgressCardComponent } from './rank-progress-card.component';

describe('RankProgressCardComponent', () => {
  let component: RankProgressCardComponent;
  let fixture: ComponentFixture<RankProgressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankProgressCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RankProgressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
