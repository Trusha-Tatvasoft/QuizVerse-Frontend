import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BattleManagementService } from './battle-management.service';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { BattleManagementData } from '../../../pages/admin/battle-management/interfaces/battle-management.interface';
import { BattleCreationStatus } from '../../../shared/enums/battle-management.enum';

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
});
