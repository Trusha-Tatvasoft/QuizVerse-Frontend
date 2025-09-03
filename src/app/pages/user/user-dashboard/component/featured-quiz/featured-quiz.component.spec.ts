import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedQuizComponent } from './featured-quiz.component';

describe('FeaturedQuizzesComponent', () => {
  let component: FeaturedQuizComponent;
  let fixture: ComponentFixture<FeaturedQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedQuizComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
