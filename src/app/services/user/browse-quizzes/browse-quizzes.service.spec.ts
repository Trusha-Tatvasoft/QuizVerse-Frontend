import { TestBed } from '@angular/core/testing';

import { BrowseQuizzesService } from './browse-quizzes.service';

describe('BrowseQuizzesService', () => {
  let service: BrowseQuizzesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowseQuizzesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
