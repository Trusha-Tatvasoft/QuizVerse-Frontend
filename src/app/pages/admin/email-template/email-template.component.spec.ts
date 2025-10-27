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
      body: '<p>Welcome body</p>',
    },
    {
      id: 2,
      title: 'Reminder',
      subject: 'Reminder Subject',
      templateType: 1,
      status: false,
      body: '<p>Reminder body</p>',
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

    expect(snackbar.showError).toHaveBeenCalledWith('Error!', 'Bad Request');
    expect(component.dataSource()).toEqual([]);
    expect(component.totalItems()).toBe(0);
  });

  it('should handle network error', () => {
    emailService.getAllEmailTemplates.mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'Server error' } })),
    );

    component.loadEmailTemplates();

    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Server error');
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
    const loadSpy = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    emailService.updateEmailTemplateByAction.mockReturnValue(
      of({ statusCode: 200, result: true, message: 'Updated' } as any),
    );

    component.updateEmailTemplateStatus(1, EmailTemplateAction.UpdateStatus);

    expect(emailService.updateEmailTemplateByAction).toHaveBeenCalledWith({
      id: 1,
      action: EmailTemplateAction.UpdateStatus,
    });
    expect(snackbar.showSuccess).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
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

  it('should not execute onConfirm when dialog is cancelled', () => {
    const spy = jest.fn();
    dialog.open.mockReturnValue({ afterClosed: () => observableOf(false) } as any);
    component.openConfirmationDialog(
      {
        title: 'Confirm',
        message: 'Do it?',
        confirmButtonConfig: { label: 'Yes' },
        cancelButtonConfig: { label: 'No' },
      },
      spy,
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('should open preview dialog on success', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: true, statusCode: 200, data: mockTemplates[0] } as any),
    );
    component.openPreviewDialog(1);

    expect(emailService.getEmailTemplateById).toHaveBeenCalledWith(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should show error if preview API returns non-200 status', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: false, statusCode: 404, message: 'Not found' } as any),
    );
    component.openPreviewDialog(1);

    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Not found');
  });

  it('should show error if preview API fails', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      throwError(() => ({ error: { message: 'Fail' } })),
    );
    component.openPreviewDialog(1);

    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Fail');
  });

  it('should handle DELETE action with confirmation', () => {
    const updateSpy = jest
      .spyOn(component, 'updateEmailTemplateStatus')
      .mockImplementation(() => {});
    const confirmSpy = jest.spyOn(component, 'openConfirmationDialog');
    dialog.open.mockReturnValue({ afterClosed: () => observableOf(true) } as any);

    const row = { id: 1 } as any;
    component.handleEmailAction({ action: emailActions.DELETE, row });

    expect(confirmSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(1, EmailTemplateAction.Delete);
  });

  it('should handle EDIT action', () => {
    const editSpy = jest.spyOn(component, 'loadEmailTemplateForEdit').mockImplementation(() => {});
    const row = { id: 1 } as any;

    component.handleEmailAction({ action: emailActions.EDIT, row });

    expect(editSpy).toHaveBeenCalledWith(1);
  });

  it('should handle ACTIVATE action with confirmation', () => {
    const updateSpy = jest
      .spyOn(component, 'updateEmailTemplateStatus')
      .mockImplementation(() => {});
    dialog.open.mockReturnValue({ afterClosed: () => observableOf(true) } as any);

    const row = { id: 1 } as any;
    component.handleEmailAction({ action: emailActions.ACTIVATE, row });

    expect(updateSpy).toHaveBeenCalledWith(
      1,
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Active,
    );
  });

  it('should handle INACTIVATE action with confirmation', () => {
    const updateSpy = jest
      .spyOn(component, 'updateEmailTemplateStatus')
      .mockImplementation(() => {});
    dialog.open.mockReturnValue({ afterClosed: () => observableOf(true) } as any);

    const row = { id: 1 } as any;
    component.handleEmailAction({ action: emailActions.INACTIVATE, row });

    expect(updateSpy).toHaveBeenCalledWith(
      1,
      EmailTemplateAction.UpdateStatus,
      EmailTemplateStatus.Inactive,
    );
  });

  it('should handle PREVIEW action', () => {
    const previewSpy = jest.spyOn(component, 'openPreviewDialog').mockImplementation(() => {});
    const row = { id: 1 } as any;

    component.handleEmailAction({ action: emailActions.PREVIEW, row });

    expect(previewSpy).toHaveBeenCalledWith(1);
  });

  it('should load email template for edit successfully', () => {
    const dialogSpy = jest
      .spyOn(component, 'openEmailTemplateDialgue')
      .mockImplementation(() => {});
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: true, statusCode: 200, data: mockTemplates[0] } as any),
    );

    component.loadEmailTemplateForEdit(1);

    expect(emailService.getEmailTemplateById).toHaveBeenCalledWith(1);
    expect(dialogSpy).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('should show error when loadEmailTemplateForEdit fails', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      of({ result: false, statusCode: 404, message: 'Not found' } as any),
    );

    component.loadEmailTemplateForEdit(1);

    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Not found');
  });

  it('should handle error in loadEmailTemplateForEdit', () => {
    emailService.getEmailTemplateById.mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } })),
    );

    component.loadEmailTemplateForEdit(1);

    expect(snackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Server error');
  });

  it('should open the email template dialog in create mode', () => {
    const loadSpy = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    const dialogRefMock = { afterClosed: () => observableOf(true) } as any;
    dialog.open.mockReturnValue(dialogRefMock);

    component.openEmailTemplateDialgue();

    expect(dialog.open).toHaveBeenCalledWith(
      EmailTemplateFormComponent,
      expect.objectContaining({
        minWidth: '50vw',
        maxWidth: '100vw',
        maxHeight: '95vh',
        autoFocus: false,
        data: { mode: 'create', templateData: null },
      }),
    );
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should open the email template dialog in edit mode', () => {
    const loadSpy = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    const dialogRefMock = { afterClosed: () => observableOf(true) } as any;
    dialog.open.mockReturnValue(dialogRefMock);

    component.openEmailTemplateDialgue(mockTemplates[0]);

    expect(dialog.open).toHaveBeenCalledWith(
      EmailTemplateFormComponent,
      expect.objectContaining({
        data: { mode: 'edit', templateData: mockTemplates[0] },
      }),
    );
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should not reload templates when dialog is closed without changes', () => {
    const loadSpy = jest.spyOn(component, 'loadEmailTemplates').mockImplementation(() => {});
    const dialogRefMock = { afterClosed: () => observableOf(false) } as any;
    dialog.open.mockReturnValue(dialogRefMock);

    component.openEmailTemplateDialgue();

    expect(loadSpy).not.toHaveBeenCalled();
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
