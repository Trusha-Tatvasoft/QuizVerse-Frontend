import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReportedQuizComponent } from './reported-quiz.component';
import { ContentModerationService } from '../../../../../services/admin/content-moderation/content-moderation.service';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { of, throwError } from 'rxjs';
import { platformMessages } from '../../../../../utils/constants';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';

describe('ReportedQuizComponent - Pagination', () => {
  let component: ReportedQuizComponent;
  let fixture: ComponentFixture<ReportedQuizComponent>;
  let mockService: jest.Mocked<ContentModerationService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;

  const mockResponse = {
    data: {
      totalRecords: 20,
      records: [
        { id: 1, title: 'Quiz A', severity: 1, status: 1 },
        { id: 2, title: 'Quiz B', severity: 2, status: 2 },
      ],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedQuizComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ContentModerationService,
          useValue: {
            getReportedQuizList: jest.fn().mockReturnValue(of(mockResponse)),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showInfo: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUserId: jest.fn().mockReturnValue(1),
            getAccessToken: jest.fn().mockReturnValue('fake-token'),
            getRoleFromToken: jest.fn().mockReturnValue('Admin'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportedQuizComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(ContentModerationService) as jest.Mocked<ContentModerationService>;
    mockSnackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges(); // triggers ngOnInit → fetchReportedQuizzes()
  });

  it('should fetch first page on init', () => {
    expect(mockService.getReportedQuizList).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNumber: 1,
        pageSize: 5,
      }),
    );
    expect(component.totalItems()).toBe(20);
    expect(component.dataSource().length).toBe(2);
  });

  it('should update pagination and fetch data when onPageChange is called', () => {
    const spy = jest.spyOn(component, 'fetchReportedQuizzes');

    component.onPageChange({ pageIndex: 2, pageSize: 10 }); // Move to page 3 (index 2)

    expect(component.pagination().pageNumber).toBe(3);
    expect(component.pagination().pageSize).toBe(10);
    expect(spy).toHaveBeenCalled();
  });

  it('should reset page number to 1 when filters are applied', () => {
    const spy = jest.spyOn(component, 'fetchReportedQuizzes');

    component.pagination.set({ pageNumber: 3, pageSize: 5 });
    component.selectedSeverity = 2;

    component.onFilterChange();

    expect(component.pagination().pageNumber).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should send severity & status filters in request', () => {
    component.selectedSeverity = 1;
    component.selectedStatus = 2;

    component.fetchReportedQuizzes();

    expect(mockService.getReportedQuizList).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          issueReportSeverity: 1,
          issueReportStatus: 2,
        },
      }),
    );
  });

  it('should show snackbar on API failure', () => {
    mockService.getReportedQuizList.mockReturnValueOnce(throwError(() => ({})));

    component.fetchReportedQuizzes();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorMessage,
      platformMessages.failToLoadReportedQuizList,
    );
  });

  it('should update sort state and fetch data when onSortChange is called', () => {
    const spy = jest.spyOn(component, 'fetchReportedQuizzes');

    component.onSortChange({ active: 'title', direction: 'desc' });

    expect(component.sort().sortColumn).toBe('title');
    expect(component.sort().sortDescending).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should map response data to dataSource and set totalItems on successful API response', () => {
    // trigger fetch
    component.fetchReportedQuizzes();

    expect(component.totalItems()).toBe(mockResponse.data.totalRecords);
    expect(component.dataSource().length).toBe(mockResponse.data.records.length);
  });

  it('should call service with sort parameters when sorted before fetching', () => {
    component.sort.set({ sortColumn: 'severity', sortDescending: true });

    component.fetchReportedQuizzes();

    expect(mockService.getReportedQuizList).toHaveBeenCalledWith(
      expect.objectContaining({
        sortColumn: 'severity',
        sortDescending: true,
      }),
    );
  });
});
