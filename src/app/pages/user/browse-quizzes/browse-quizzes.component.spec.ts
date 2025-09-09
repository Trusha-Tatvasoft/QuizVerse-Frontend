import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseQuizzesComponent } from './browse-quizzes.component';

describe('BrowseQuizzesComponent', () => {
  let component: BrowseQuizzesComponent;
  let fixture: ComponentFixture<BrowseQuizzesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseQuizzesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
