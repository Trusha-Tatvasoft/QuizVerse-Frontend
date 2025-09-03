import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedQuizzesComponent } from './featured-quiz.component';

describe('FeaturedQuizzesComponent', () => {
  let component: FeaturedQuizzesComponent;
  let fixture: ComponentFixture<FeaturedQuizzesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedQuizzesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
