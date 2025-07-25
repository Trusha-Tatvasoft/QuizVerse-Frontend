import { TestBed } from '@angular/core/testing';
import { LandingPageDataService } from './landing-page-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { LandingPageStats } from '../../../shared/interfaces/landing-page-stats.interface';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

export const MOCK_LANDING_STATS: ApiResponse<LandingPageStats> = {
  result: true,
  statusCode: 200,
  message: 'Mock stats loaded successfully',
  data: {
    quote: 'ABCD EFGH IJKL MNOP QRST UVWX YZ',
    activePlayer: 1234,
    quizCreated: 560,
    questionAns: 7890000,
  },
};

describe('LandingPageDataService', () => {
  let service: LandingPageDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LandingPageDataService],
    });

    service = TestBed.inject(LandingPageDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch mock landing page stats', (done) => {
    service.getStats().subscribe((response) => {
      expect(response).toEqual(MOCK_LANDING_STATS);
      done();
    });
    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.LandingPageData}`);
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_LANDING_STATS);
  });
});
