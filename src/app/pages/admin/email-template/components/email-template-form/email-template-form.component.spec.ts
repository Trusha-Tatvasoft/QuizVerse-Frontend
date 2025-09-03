import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { EmailTemplateFormComponent } from './email-template-form.component';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';

// utils
import * as wrapperUtils from '../../../../../utils/get-email-template-header.utils';
import { EmailTemplateService } from '../../../../../services/admin/email-templates/email-template.service';
import { EmailTemplateType } from '../../../../../shared/enums/email-template.enum';
import { platformMessages } from '../../../../../utils/constants';

describe('EmailTemplateFormComponent', () => {
  let component: EmailTemplateFormComponent;
  let fixture: ComponentFixture<EmailTemplateFormComponent>;

  let mockEmailTemplateService: any;
  let mockSnackbar: any;
  let mockMatDialog: any;

  beforeEach(async () => {
    mockEmailTemplateService = {
      getEmailTemplateById: jest.fn(),
      addOrEditEmailTemplate: jest.fn(),
    };
    mockSnackbar = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    };
    mockMatDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EmailTemplateFormComponent],
      providers: [
        { provide: EmailTemplateService, useValue: mockEmailTemplateService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatDialogRef, useValue: { close: jest.fn() } }, // ✅ stub
        { provide: MAT_DIALOG_DATA, useValue: { id: 123 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and form with default values', () => {
    expect(component).toBeTruthy();
    expect(component.form.contains('title')).toBe(true);
    expect(component.form.contains('subject')).toBe(true);
    expect(component.form.contains('body')).toBe(true);
    expect(component.form.contains('templateType')).toBe(true);
    expect(component.form.contains('status')).toBe(true);
  });

  it('should load email template in edit mode', () => {
    const mockResponse = {
      result: true,
      data: {
        id: 1,
        title: 'Welcome',
        subject: 'Hello!',
        templateType: 1,
        body: 'Email Body',
        status: true,
      },
    };

    mockEmailTemplateService.getEmailTemplateById.mockReturnValue(of(mockResponse));

    component['mode'] = 'edit';
    component.loadEmailTemplate(1);

    expect(mockEmailTemplateService.getEmailTemplateById).toHaveBeenCalledWith(1);
    expect(component.form.get('title')?.value).toBe('Welcome');
    expect(component.form.get('subject')?.value).toBe('Hello!');
  });

  it('should wrap body if wrapper not found', () => {
    jest.spyOn(wrapperUtils, 'hasEmailTemplateWrapper').mockReturnValue(false);
    jest
      .spyOn(wrapperUtils, 'getEmailTemplateHtml')
      .mockImplementation((body: string) => `<div>${body}</div>`);

    const result = component.wrapBodyIfNeeded('Hello');
    expect(result).toBe('<div>Hello</div>');
  });

  it('should not wrap body if wrapper already exists', () => {
    jest.spyOn(wrapperUtils, 'hasEmailTemplateWrapper').mockReturnValue(true);

    const wrapped = '<div style="margin:auto;">Hello</div>';
    const result = component.wrapBodyIfNeeded(wrapped);
    expect(result).toBe(wrapped);
  });

  it('should return missing placeholders error in getError', () => {
    component.form.get('body')?.setErrors({ missingPlaceholders: ['{{user}}'] });
    const error = component.getError('body');
    expect(error).toContain('Missing placeholders: {{user}}');
  });

  it('should return validation error message in getError', () => {
    const control = component.form.get('title');
    control?.setErrors({ required: true });
    jest
      .spyOn(component['validationErrorService'], 'getErrorMessage')
      .mockReturnValue('Title required');
    const error = component.getError('title');
    expect(error).toBe('Title required');
  });

  it('should mark all as touched if saveEmailTemplate is called with invalid form', () => {
    component.form.reset();
    const markAllSpy = jest.spyOn(component.form, 'markAllAsTouched');
    component.saveEmailTemplate();
    expect(markAllSpy).toHaveBeenCalled();
  });

  it('should close the dialog when closeDialog is called', () => {
    const spy = jest.spyOn(component['dialogRef'], 'close');
    component.closeDialog();
    expect(spy).toHaveBeenCalled();
  });

  it('should mark form as touched if openPreviewDialog is called with invalid form', () => {
    component.form.reset();
    const markAllSpy = jest.spyOn(component.form, 'markAllAsTouched');
    component.openPreviewDialog();
    expect(markAllSpy).toHaveBeenCalled();
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should save email template successfully in create mode', () => {
    component.form.patchValue({
      templateType: EmailTemplateType.WelcomeEmail,
      title: 'Test Title',
      subject: 'Test Subject',
      body: '{{user}} {{email}} {{registrationDate}} {{loginUrl}} {{year}} {{companyName}}',
      status: true,
    });
    component.form.updateValueAndValidity();

    expect(component.form.valid).toBe(true);

    mockEmailTemplateService.addOrEditEmailTemplate.mockReturnValue(
      of({ result: true, statusCode: 200, message: 'Saved successfully' }),
    );
    component.saveEmailTemplate();

    expect(mockEmailTemplateService.addOrEditEmailTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateType: EmailTemplateType.WelcomeEmail,
        title: 'Test Title',
        subject: 'Test Subject',
        body: '{{user}} {{email}} {{registrationDate}} {{loginUrl}} {{year}} {{companyName}}',
        status: true,
      }),
    );

    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      'Saved successfully',
    );
  });

  it('should show error when saveEmailTemplate fails', fakeAsync(() => {
    component.form.patchValue({
      templateType: EmailTemplateType.AccountSuspension,
      title: 'Invalid Test',
      subject: 'Invalid Subject',
      body: "{{user}}', '{{email}} </div>",
      status: true,
    });
    component.form.updateValueAndValidity();

    mockEmailTemplateService.addOrEditEmailTemplate.mockReturnValue(
      throwError(() => ({ error: { message: 'Save failed' } })),
    );

    component.saveEmailTemplate();
    tick();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(platformMessages.errorTitle, 'Save failed');
  }));

  it('should return empty string if body is empty in wrapBodyIfNeeded', () => {
    const result = component.wrapBodyIfNeeded('');
    expect(result).toBe('');
  });

  it('should return null from getError if control is not found', () => {
    const result = component.getError('nonExistingControl');
    expect(result).toBeNull();
  });

  it('should show error snackbar when loadEmailTemplate API fails', () => {
    mockEmailTemplateService.getEmailTemplateById.mockReturnValue(
      throwError(() => new Error('API error')),
    );

    component.loadEmailTemplate(99);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.failedToFetchTemplate,
    );
  });

  it('should show generic error if email template response is invalid', () => {
    const response = { result: false, data: null };
    mockEmailTemplateService.getEmailTemplateById.mockReturnValue(of(response));

    component.loadEmailTemplate(123);

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.errorMessage,
    );
  });

  it('should cast status to boolean when loading template', () => {
    const response = {
      result: true,
      data: {
        id: 1,
        title: 'Test',
        subject: 'Subject',
        templateType: 1,
        body: 'Body',
        status: 1,
      },
    };

    mockEmailTemplateService.getEmailTemplateById.mockReturnValue(of(response));
    component.loadEmailTemplate(1);

    expect(component.form.get('status')?.value).toBe(true);
  });

  it('should save email template in edit mode and include id', () => {
    component['mode'] = 'edit';

    component.form.patchValue({
      templateType: EmailTemplateType.WelcomeEmail,
      title: 'Test Title',
      subject: 'Test Subject',
      body: '{{user}} {{email}} {{registrationDate}} {{loginUrl}} {{year}} {{companyName}}',
      status: true,
    });
    component.form.updateValueAndValidity();

    mockEmailTemplateService.addOrEditEmailTemplate.mockReturnValue(
      of({ result: true, message: 'Updated successfully' }),
    );

    component.saveEmailTemplate();

    expect(mockEmailTemplateService.addOrEditEmailTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 123 }),
    );
    expect(mockSnackbar.showSuccess).toHaveBeenCalledWith(
      platformMessages.successTitle,
      'Updated successfully',
    );
  });

  it('should show generic error if saveEmailTemplate fails without error.message', fakeAsync(() => {
    component.form.patchValue({
      templateType: EmailTemplateType.WelcomeEmail,
      title: 'Test Title',
      subject: 'Test Subject',
      body: '{{user}} {{email}} {{registrationDate}} {{loginUrl}} {{year}} {{companyName}}',
      status: true,
    });
    component.form.updateValueAndValidity();

    mockEmailTemplateService.addOrEditEmailTemplate.mockReturnValue(
      throwError(() => ({})), // no error.message
    );

    component.saveEmailTemplate();
    tick();

    expect(mockSnackbar.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      platformMessages.failedToSaveTemplate,
    );
  }));

  it('should call loadEmailTemplate on ngOnInit if mode is edit and id is provided', () => {
    const loadSpy = jest.spyOn(component, 'loadEmailTemplate').mockImplementation();
    (component as any).mode = 'edit';
    (component as any)['data'] = { id: 456 };

    component.ngOnInit();

    expect(loadSpy).toHaveBeenCalledWith(456);
  });
});
