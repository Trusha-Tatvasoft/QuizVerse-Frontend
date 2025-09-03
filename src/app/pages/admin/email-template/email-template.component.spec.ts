import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EmailTemplateComponent } from './email-template.component';
import { EmailTemplateService } from '../../../services/admin/email-templates/email-template.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { emailTemplateToTableData } from './email-template.component.mapper';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from './configs/email-template.component.config';
import { platformMessages } from '../../../utils/constants';

describe('EmailTemplateComponent (Jest)', () => {
  let component: EmailTemplateComponent;
  let fixture: ComponentFixture<EmailTemplateComponent>;
  let emailService: jest.Mocked<EmailTemplateService>;
  let snackbar: jest.Mocked<SnackbarService>;

  const mockTemplates: EmailTemplatesResponseDto[] = [
    {
      id: 1,
      title: 'Welcome',
      subject: 'Welcome Subject',
      templateType: 0,
      status: true,
      body: null,
    },
    {
      id: 2,
      title: 'Reminder',
      subject: 'Reminder Subject',
      templateType: 1,
      status: false,
      body: null,
    },
  ];

  beforeEach(async () => {
    const emailServiceMock = {
      getAllEmailTemplates: jest.fn(),
    } as unknown as jest.Mocked<EmailTemplateService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [EmailTemplateComponent],
      providers: [
        { provide: EmailTemplateService, useValue: emailServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
    emailService = TestBed.inject(EmailTemplateService) as jest.Mocked<EmailTemplateService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load email templates successfully', () => {
    const mockResponse: ApiResponse<PaginatedDataResponse<EmailTemplatesResponseDto>> = {
      result: true,
      statusCode: 200,
      message: 'Fetched successfully',
      data: {
        totalRecords: 2,
        records: mockTemplates,
      },
    };

    emailService.getAllEmailTemplates.mockReturnValue(of(mockResponse));

    component.loadEmailTemplates();

    expect(emailService.getAllEmailTemplates).toHaveBeenCalled();
    expect(component.dataSource()).toEqual(mockTemplates.map(emailTemplateToTableData));
    expect(component.totalItems()).toBe(2);
  });

  it('should handle API error (status not 200)', () => {
    const mockResponse: ApiResponse<PaginatedDataResponse<EmailTemplatesResponseDto>> = {
      result: false,
      statusCode: 400,
      message: 'Bad Request',
      data: { totalRecords: 0, records: [] },
    };

    emailService.getAllEmailTemplates.mockReturnValue(of(mockResponse));

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 400', 'Bad Request');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should handle network error', () => {
    emailService.getAllEmailTemplates.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'Server error' } })),
    );

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 500', 'Server error');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should update sort and reload templates on sort change', () => {
    const spyLoad = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    component.onSortChange({ active: 'title', direction: 'asc' });

    expect(component.sort()).toEqual({ sortColumn: 'title', sortDescending: false });
    expect(spyLoad).toHaveBeenCalled();
  });

  it('should clean up destroy$ on ngOnDestroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
  it('should call loadEmailTemplates on init', () => {
    const spyLoad = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    component.ngOnInit();
    expect(spyLoad).toHaveBeenCalled();
  });
  it('should call openEmailTemplateDialgue without errors', () => {
    expect(() => component.openEmailTemplateDialgue()).not.toThrow();
  });
  it('should handle case where result is true but statusCode is not 200', () => {
    const mockResponse = {
      result: true,
      statusCode: 500,
      message: 'Internal Server Error',
      data: { totalRecords: 0, records: [] },
    };

    emailService.getAllEmailTemplates.mockReturnValue(of(mockResponse as any));

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 500', 'Internal Server Error');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should handle case where result is false but statusCode is 200', () => {
    const mockResponse = {
      result: false,
      statusCode: 200,
      message: 'No templates found',
      data: { totalRecords: 0, records: [] },
    };

    emailService.getAllEmailTemplates.mockReturnValue(of(mockResponse as any));

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 200', 'No templates found');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });
  it('should use fallback error message when response.message is missing', () => {
    const mockResponse = {
      result: false,
      statusCode: 400,
      message: undefined, // 👈 force fallback
      data: { totalRecords: 0, records: [] },
    };

    emailService.getAllEmailTemplates.mockReturnValue(of(mockResponse as any));

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 400', platformMessages.errorMessage);
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });
  it('should use fallback error message when network error has no message', () => {
    emailService.getAllEmailTemplates.mockReturnValue(
      throwError(() => ({ status: 500, error: {} })), // 👈 no message here
    );

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith('Error! 500', platformMessages.errorMessage);
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });
});
