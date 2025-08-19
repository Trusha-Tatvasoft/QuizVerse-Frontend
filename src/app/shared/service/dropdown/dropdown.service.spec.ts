import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DropdownService } from './dropdown.service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { DropDownType } from '../../enums/dropdown-types.enum';
import { EndPoints } from '../../enums/end-point.enum';
import { environment } from '../../../../environments/environment.dev';

describe('DropdownService', () => {
  let service: DropdownService;
  let httpMock: HttpTestingController;
  let snackbarService: jest.Mocked<SnackbarService>;

  beforeEach(() => {
    snackbarService = { showError: jest.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DropdownService,
        { provide: SnackbarService, useValue: snackbarService },
      ],
    });

    service = TestBed.inject(DropdownService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch dropdown data successfully', () => {
    const mockData = [{ id: 1, name: 'Category 1' }];

    service.getDropdownData(DropDownType.QuizCategory).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.DropDownData}?type=${DropDownType.QuizCategory}`,
    );
    expect(req.request.method).toBe('GET');

    req.flush({ data: mockData });
    expect(snackbarService.showError).not.toHaveBeenCalled();
  });

  it('should show snackbar and return empty array on error', () => {
    service.getDropdownData(DropDownType.QuizCategory).subscribe((data) => {
      expect(data).toEqual([]);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/${EndPoints.DropDownData}?type=${DropDownType.QuizCategory}`,
    );
    expect(req.request.method).toBe('GET');

    req.flush('Error loading data', { status: 400, statusText: 'Bad Request' });

    expect(snackbarService.showError).toHaveBeenCalledWith('Error', 'Failed to load the dropdown');
  });
});
