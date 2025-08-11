import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizDifficultyLevelService } from './quiz-difficulty-level.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { DifficultyLevelCredentials } from '../../../pages/admin/quiz-difficulty-level/interfaces/quiz-difficulty-level.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

describe('QuizDifficultyLevelService (Jest)', () => {
  let service: QuizDifficultyLevelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuizDifficultyLevelService],
    });

    service = TestBed.inject(QuizDifficultyLevelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all quiz difficulties', () => {
    const mockResponse: ApiResponse<DifficultyLevelCredentials[]> = {
      result: true,
      statusCode: 200,
      message: 'Fetched successfully',
      data: [
        { name: 'Easy', description: 'Easy level' },
        { name: 'Medium', description: 'Medium level' },
      ],
    };

    service.getAllQuizDifficulties().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuizDifficultyLevel}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should check if name exists', () => {
    const testName = 'Easy';
    const mockResponse: ApiResponse<boolean> = {
      result: true,
      statusCode: 200,
      message: 'Available',
      data: true,
    };

    service.checkNameExists(testName).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuizDifficultyNameAvailable}/${encodeURIComponent(testName)}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-Skip-Loader')).toBe('true');
    req.flush(mockResponse);
  });

  it('should create difficulty level', () => {
    const testData: DifficultyLevelCredentials = {
      name: 'Hard',
      description: 'Hard level',
    };

    const mockResponse: ApiResponse<null> = {
      result: true,
      statusCode: 201,
      message: 'Created successfully',
      data: null,
    };

    service.createDifficultyLevel(testData).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateQuizDifficultyLevel}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);
    req.flush(mockResponse);
  });
});
