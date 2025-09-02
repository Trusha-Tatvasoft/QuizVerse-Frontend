import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentQuizResultComponent } from './recent-quiz-result.component';

describe('RecentQuizResultComponent', () => {
  let component: RecentQuizResultComponent;
  let fixture: ComponentFixture<RecentQuizResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentQuizResultComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentQuizResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
