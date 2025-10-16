import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BattleManagementService } from './battle-management.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BattleManagementData } from '../../../pages/admin/battle-management/interfaces/battle-management.interface';
import { BattleCreationStatus } from '../../../shared/enums/battle-management.enum';
import { DropDownData } from '../../../shared/interfaces/drop-down-data.interface';
import {
  BattleResponse,
  QuestionDifficultyXP,
  SaveBattleRequest,
} from '../../../pages/admin/battle-management/interfaces/battle-creation.interface';
import { PaginationRequest } from '../../../shared/interfaces/pagination-request.interface';
import {
  ExportQuizQuestionsRequestDto,
  QuestionPoolList,
  QuestionResponseDto,
} from '../../../shared/interfaces/quiz-creation.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';

describe('BattleManagementService', () => {
  let service: BattleManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BattleManagementService],
    });

    service = TestBed.inject(BattleManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no pending requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mapped battles when API response is successful', (done) => {
    const mockApiResponse: ApiResponse<BattleManagementData[]> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: [
        {
          id: 1,
          battleName: 'Test Battle',
          categoryName: 'General',
          description: 'Mock battle',
          totalParticipants: 10,
          totalXp: 100,
          battleTime: 1,
          startDate: new Date('2025-08-19T00:00:00Z'), // 👈 API sends string
          endDate: new Date('2025-08-20T00:00:00Z'),
          battleDifficulty: 'Easy',
          totalQuestion: 5,
          battleStatus: BattleCreationStatus.Active, // 👈 must match your enum
        },
      ],
    };

    service.getBattles().subscribe((battles) => {
      expect(battles.length).toBe(1);
      expect(battles[0].battleName).toBe('Test Battle');
      expect(battles[0].dateRange.start).toBeInstanceOf(Date); // 👈 mapper converts string → Date
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.BattleManagementList}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should return empty array when API fails or result is false', (done) => {
    const mockApiResponse: ApiResponse<BattleManagementData[]> = {
      statusCode: 400,
      result: false,
      message: 'Error',
      data: [],
    };

    service.getBattles().subscribe((battles) => {
      expect(battles).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.BattleManagementList}`);
    req.flush(mockApiResponse);
  });

  // Test for getDropDownData
  it('should fetch dropdown data for a given type', (done) => {
    const type = 1;
    const mockApiResponse: ApiResponse<DropDownData[]> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: [{ id: 1, name: 'Category 1' }],
    };

    service.getDropDownData(type).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.length).toBe(1);
      expect(response.data[0].name).toBe('Category 1');
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.DropDownData}?type=${type}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  // Test for getQuestionDifficultyXP
  it('should fetch question difficulty XP data', (done) => {
    const mockApiResponse: ApiResponse<QuestionDifficultyXP[]> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: [{ questionDifficultyId: 1, questionDifficultyName: 'Easy', xpGained: 10 }],
    };

    service.getQuestionDifficultyXP().subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.length).toBe(1);
      expect(response.data[0].questionDifficultyName).toBe('Easy');
      expect(response.data[0].xpGained).toBe(10);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuestionDifficultyXP}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  // Test for getQuestions
  it('should fetch paginated question pool list', (done) => {
    const mockRequest: PaginationRequest = { pageNumber: 1, pageSize: 10, sortDescending: false };
    const mockApiResponse: ApiResponse<PaginatedDataResponse<QuestionPoolList>> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: {
        totalRecords: 1,
        records: [
          {
            id: 1,
            categoryId: 1,
            categoryName: 'General',
            queDifficultyId: 1,
            queDifficultyName: 'Easy',
            queText: 'What is 2+2?',
            queTypeId: 1,
            queTypeName: 'MCQ',
            queOptionsAns: [{ key: 'A', value: '4', id: 1 }],
          },
        ],
      },
    };

    service.getQuestions(mockRequest).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.totalRecords).toBe(1);
      expect(response.data.records[0].queText).toBe('What is 2+2?');
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.QuestionPoolList}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockApiResponse);
  });

  // Test for getQuestionsFromCsv
  it('should import questions from a CSV file', (done) => {
    const mockFile = new File([''], 'questions.csv');
    const mockApiResponse: ApiResponse<QuestionResponseDto[]> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: [
        {
          id: 1,
          categoryId: 1,
          queDifficultyId: 1,
          queText: 'What is 2+2?',
          queTypeId: 1,
          queOptionsAns: [{ key: 'A', value: '4', id: 1, questionId: 1 }],
        },
      ],
    };

    service.getQuestionsFromCsv(mockFile).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.length).toBe(1);
      expect(response.data[0].queText).toBe('What is 2+2?');
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromCsv}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockApiResponse);
  });

  // Test for getQuestionsFromExcel
  it('should import questions from an Excel file', (done) => {
    const mockFile = new File([''], 'questions.xlsx');
    const mockApiResponse: ApiResponse<QuestionResponseDto[]> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: [
        {
          id: 2,
          categoryId: 1,
          queDifficultyId: 2,
          queText: 'What is 3+3?',
          queTypeId: 1,
          queOptionsAns: [{ key: 'A', value: '6', id: 2, questionId: 2 }],
        },
      ],
    };

    service.getQuestionsFromExcel(mockFile).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.length).toBe(1);
      expect(response.data[0].queText).toBe('What is 3+3?');
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.PreviewQuestionsFromExcel}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockApiResponse);
  });

  // Test for exportCsv
  it('should export questions to a CSV file', (done) => {
    const mockRequest: ExportQuizQuestionsRequestDto = {
      quizName: 'Test Quiz',
      questions: [
        {
          categoryId: 1,
          queDifficultyId: 1,
          queText: 'What is 2+2?',
          queTypeId: 1,
          queOptionsAns: [{ key: 'A', value: '4' }],
        },
      ],
    };
    const mockBlob = new Blob([''], { type: 'text/csv' });

    service.exportCsv(mockRequest).subscribe((blob) => {
      expect(blob).toBeInstanceOf(Blob);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.ExportQuestions}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  // Test for deleteBattle
  it('should delete a battle by ID', (done) => {
    const battleId = 1;
    const mockApiResponse: ApiResponse<null> = {
      statusCode: 200,
      result: true,
      message: 'Battle deleted successfully',
      data: null,
    };

    service.deleteBattle(battleId).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.DeleteBattle}/${battleId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockApiResponse);
  });

  // Test for getBattle
  it('should fetch battle details by ID', (done) => {
    const battleId = 1;
    const mockApiResponse: ApiResponse<BattleResponse> = {
      statusCode: 200,
      result: true,
      message: 'Success',
      data: {
        id: 1,
        name: 'Test Battle',
        description: 'Mock battle',
        battleType: 1,
        startDate: new Date('2025-08-19T00:00:00Z'),
        endDate: new Date('2025-08-20T00:00:00Z'),
        totalTime: 1,
        totalQuestion: 5,
        totalXp: 100,
        status: BattleCreationStatus.Active,
        difficultyLevelId: 1,
        categoryId: 1,
        questions: [
          {
            id: 1,
            categoryId: 1,
            queDifficultyId: 1,
            queText: 'What is 2+2?',
            queTypeId: 1,
            queOptionsAns: [{ key: 'A', value: '4', id: 1 }],
          },
        ],
        questionsDifficulty: [{ queDifficultyId: 1, noOfQues: 5, timePerQuestion: 30 }],
      },
    };

    service.getBattle(battleId).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data.name).toBe('Test Battle');
      expect(response.data?.questions?.length ?? 0).toBe(1);
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.GetBattleById}/${battleId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  // Test for createOrUpdateBattle
  it('should create or update a battle', (done) => {
    const mockRequest: SaveBattleRequest = {
      name: 'New Battle',
      description: 'New battle description',
      difficultyLevelId: 1,
      categoryId: 1,
      battleType: 1,
      startDate: '2025-08-19T00:00:00Z',
      endDate: '2025-08-20T00:00:00Z',
      totalTime: 1,
      totalQuestion: 5,
      totalXp: 100,
      questions: [
        {
          categoryId: 1,
          queDifficultyId: 1,
          queText: 'What is 2+2?',
          queTypeId: 1,
          queOptionsAns: [{ key: 'A', value: '4' }],
        },
      ],
      questionsDifficulty: [{ queDifficultyId: 1, noOfQues: 5, timePerQuestion: 30 }],
    };
    const mockApiResponse: ApiResponse<null> = {
      statusCode: 200,
      result: true,
      message: 'Battle created successfully',
      data: null,
    };

    service.createOrUpdateBattle(mockRequest).subscribe((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.data).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/${EndPoints.CreateOrUpdateBattle}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockApiResponse);
  });
});
