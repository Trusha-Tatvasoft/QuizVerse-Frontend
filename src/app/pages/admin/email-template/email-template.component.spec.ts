import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EmailTemplateComponent } from './email-template.component';
import { EmailTemplateService } from '../../../services/admin/email-templates/email-template.service';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { emailTemplateToTableData } from './email-template.component.mapper';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { PaginatedDataResponse } from '../../../shared/interfaces/paginated-data-response.interface';
import { EmailTemplatesResponseDto } from './configs/email-template.component.config';
import {
  platformMessages,
  emailActions,
  emailTemplateActionMessages,
} from '../../../utils/constants';
import { MatDialog } from '@angular/material/dialog';
import {
  EmailTemplateAction,
  EmailTemplateStatus,
} from '../../../shared/enums/email-template.enum';
import { of as observableOf } from 'rxjs';
import { EmailTemplateFormComponent } from './components/email-template-form/email-template-form.component';

describe('EmailTemplateComponent (Jest)', () => {
  let component: EmailTemplateComponent;
  let fixture: ComponentFixture<EmailTemplateComponent>;
  let emailService: jest.Mocked<EmailTemplateService>;
  let snackbar: jest.Mocked<SnackbarService>;
  let dialog: jest.Mocked<MatDialog>;

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
      updateEmailTemplateByAction: jest.fn(),
      getEmailTemplateById: jest.fn(),
    } as unknown as jest.Mocked<EmailTemplateService>;

    const snackbarMock = {
      showError: jest.fn(),
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    const dialogMock = {
      open: jest.fn().mockReturnValue({ afterClosed: () => observableOf(true) }),
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [EmailTemplateComponent],
      providers: [
        { provide: EmailTemplateService, useValue: emailServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
    emailService = TestBed.inject(EmailTemplateService) as jest.Mocked<EmailTemplateService>;
    snackbar = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
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

  it('should call updateEmailTemplateStatus and show success', () => {
    emailService.updateEmailTemplateByAction.mockReturnValue(
      of({ statusCode: 200, result: true, message: 'Updated' } as any),
    );
    component.updateEmailTemplateStatus(1, EmailTemplateAction.UpdateStatus);

    expect(emailService.updateEmailTemplateByAction).toHaveBeenCalledWith({
      id: 1,
      action: EmailTemplateAction.UpdateStatus,
    });
    expect(snackbar.showSuccess).toHaveBeenCalled();
  });

  it('should handle updateEmailTemplateStatus failure', () => {
    emailService.updateEmailTemplateByAction.mockReturnValue(
      of({ statusCode: 400, result: false, message: 'Failed' } as any),
    );
    component.updateEmailTemplateStatus(1, EmailTemplateAction.UpdateStatus);

    expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'Failed');
  });

  it('should handle error in updateEmailTemplateStatus', () => {
    emailService.updateEmailTemplateByAction.mockReturnValue(
      throwError(() => ({ error: { message: 'Boom' } })),
    );
    component.updateEmailTemplateStatus(1, EmailTemplateAction.UpdateStatus);

    expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'Boom');
  });

  it('should open confirmation dialog and execute onConfirm', () => {
    const spy = jest.fn();
    dialog.open.mockReturnValue({ afterClosed: () => observableOf(true) } as any);
    component.openConfirmationDialog(
      {
        title: 'Confirm',
        message: 'Do it?',
        confirmButtonConfig: { label: 'Yes' },
        cancelButtonConfig: { label: 'No' },
      },
      spy,
    );

    expect(spy).toHaveBeenCalled();
  });

  it('should open preview dialog on success', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: true, statusCode: 200, data: { id: 1 } } as any),
    );
    component.openPreviewDialog(1);

    expect(emailService.getEmailTemplateById).toHaveBeenCalledWith(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should show error if preview API fails', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: false, statusCode: 500, message: 'Fail' } as any),
    );
    component.openPreviewDialog(1);

    expect(snackbar.showError).toHaveBeenCalledWith('Error', 'Fail');
  });

  it('should handle error in preview dialog', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      throwError(() => ({ error: { message: 'Server unavailable' } })),
    );
    component.openPreviewDialog(1);

    expect(snackbar.showError).toHaveBeenCalledWith('Error', 'Server unavailable');
  });

  it('should handle all email actions', () => {
    const updateSpy = jest
      .spyOn(component, 'updateEmailTemplateStatus')
      .mockImplementation(() => {});
    const editSpy = jest.spyOn(component, 'openEmailTemplateDialgue').mockImplementation(() => {});
    const previewSpy = jest.spyOn(component, 'openPreviewDialog').mockImplementation(() => {});
    const row = { id: 1 } as any;

    component.handleEmailAction({ action: emailActions.DELETE, row });
    component.handleEmailAction({ action: emailActions.EDIT, row });
    component.handleEmailAction({ action: emailActions.ACTIVATE, row });
    component.handleEmailAction({ action: emailActions.INACTIVATE, row });
    component.handleEmailAction({ action: emailActions.PREVIEW, row });

    // DELETE is first call
    expect(updateSpy).toHaveBeenNthCalledWith(1, 1, EmailTemplateAction.Delete);

    // ACTIVATE is second call
    expect(updateSpy).toHaveBeenNthCalledWith(
      2,
      1,
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Active,
    );

    // INACTIVATE is third call
    expect(updateSpy).toHaveBeenNthCalledWith(
      3,
      1,
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Inactive,
    );

    // EDIT and PREVIEW
    expect(editSpy).toHaveBeenCalledWith('edit', 1);
    expect(previewSpy).toHaveBeenCalledWith(1);
  });

  it('should open the email template dialog with correct mode and template id', () => {
    const dialogRefMock = { afterClosed: () => observableOf(true) } as any;
    const openSpy = jest.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    // Call with default 'create' mode
    component.openEmailTemplateDialgue();
    expect(openSpy).toHaveBeenCalledWith(
      EmailTemplateFormComponent,
      expect.objectContaining({
        minWidth: '50vw',
        maxWidth: '100vw',
        maxHeight: '95vh',
        autoFocus: false,
        data: { mode: 'create', id: undefined },
      }),
    );

    // Call with 'edit' mode and template id
    component.openEmailTemplateDialgue('edit', 123);
    expect(openSpy).toHaveBeenCalledWith(
      EmailTemplateFormComponent,
      expect.objectContaining({
        data: { mode: 'edit', id: 123 },
      }),
    );
  });

  it('should return correct action message for Delete', () => {
    const result = component.getEmailTemplateActionMessage(EmailTemplateAction.Delete);
    expect(result).toBe(emailTemplateActionMessages.deleted);
  });

  it('should return correct action message for UpdateStatus with Active', () => {
    const result = component.getEmailTemplateActionMessage(
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Active,
    );
    expect(result).toBe(emailTemplateActionMessages.activated);
  });

  it('should return correct action message for UpdateStatus with Inactive', () => {
    const result = component.getEmailTemplateActionMessage(
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Inactive,
    );
    expect(result).toBe(emailTemplateActionMessages.inactivated);
  });

  it('should return default statusUpdated message if status is undefined', () => {
    const result = component.getEmailTemplateActionMessage(EmailTemplateAction.UpdateStatus);
    expect(result).toBe(emailTemplateActionMessages.statusUpdated);
  });

  it('ngOnInit should call loadEmailTemplates', () => {
    const loadSpy = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalled();
  });
});
