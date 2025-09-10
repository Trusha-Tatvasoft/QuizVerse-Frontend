import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuestionDifficultyService } from './question-difficulty.service';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';
import {
  QuestionDifficultyRequestDTO,
  QuestionDifficultyResponseDTO,
} from '../../../pages/admin/question-difficulty/interfaces/question-difficulty.interface';
import { skipLoader } from '../../../utils/constants';

describe('QuestionDifficultyService', () => {
  let service: QuestionDifficultyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionDifficultyService],
    });

    service = TestBed.inject(QuestionDifficultyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all question difficulties', () => {
    const mockData: QuestionDifficultyResponseDTO[] = [
      { id: 1, name: 'Easy', description: 'Simple', xpGained: 10, totalQuestions: 5 },
    ];

    service.getAllQuestionDifficulties().subscribe((res) => {
      expect(res.data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetAllQuestionDifficulties}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ result: true, statusCode: 200, message: '', data: mockData });
  });

  it('should delete a question difficulty', () => {
    service.deleteQuestionDifficulty(1).subscribe((res) => {
      expect(res.result).toBe(true);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.DeleteQuestionDifficulty}?questionDifficultiesId=1`,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ result: true, statusCode: 200, message: '', data: null });
  });

  it('should check if name exists', () => {
    const name = 'Easy';
    service.checkNameExists(name).subscribe((res) => {
      expect(res.data).toBe(true);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyNameAvailable}/${encodeURIComponent(name)}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');

    req.flush({ result: true, statusCode: 200, message: '', data: true });
  });

  it('should check if XP exists', () => {
    const xp = 10;
    service.checkXPExists(xp).subscribe((res) => {
      expect(res.data).toBe(true);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyXPAvailable}/${encodeURIComponent(xp)}`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get(skipLoader)).toBe('true');

    req.flush({ result: true, statusCode: 200, message: '', data: true });
  });

  it('should create a question difficulty', () => {
    const payload: QuestionDifficultyRequestDTO = {
      name: 'Medium',
      description: 'Moderate',
      xpGainedPerQuestion: 20,
    };

    service.createQuestionDifficultyLevel(payload).subscribe((res) => {
      expect(res.result).toBe(true);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestionDifficultyLevel}`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ result: true, statusCode: 200, message: '', data: null });
  });

  it('should handle error when getAllQuestionDifficulties fails', () => {
    service.getAllQuestionDifficulties().subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.GetAllQuestionDifficulties}`,
    );
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('should handle error when deleteQuestionDifficulty fails', () => {
    service.deleteQuestionDifficulty(1).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err.status).toBe(404),
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.DeleteQuestionDifficulty}?questionDifficultiesId=1`,
    );
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should handle error when checkNameExists fails', () => {
    service.checkNameExists('Easy').subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err.status).toBe(400),
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyNameAvailable}/Easy`,
    );
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle error when checkXPExists fails', () => {
    service.checkXPExists(10).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err.status).toBe(400),
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.QuestionDifficultyXPAvailable}/10`,
    );
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle error when createQuestionDifficultyLevel fails', () => {
    const payload: QuestionDifficultyRequestDTO = {
      name: 'Medium',
      description: 'Moderate',
      xpGainedPerQuestion: 20,
    };

    service.createQuestionDifficultyLevel(payload).subscribe({
      next: () => fail('should have failed'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.CreateOrUpdateQuestionDifficultyLevel}`,
    );
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });
});
