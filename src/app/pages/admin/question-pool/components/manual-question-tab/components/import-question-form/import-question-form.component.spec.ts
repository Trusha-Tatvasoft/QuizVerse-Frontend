import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ImportQuestionFormComponent } from './import-question-form.component';
import { QuestionPoolService } from '../../../../../../../services/admin/question-pool/question-pool.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { ImportQuestionPreviewComponent } from '../import-question-preview/import-question-preview.component';
import { ValidationErrorService } from '../../../../../../../shared/service/validation-error/validation-error.service';

describe('ImportQuestionFormComponent', () => {
  let component: ImportQuestionFormComponent;
  let fixture: ComponentFixture<ImportQuestionFormComponent>;

  const questionPoolServiceMock = {
    previewQuestionsFromCsv: jest.fn(),
    previewQuestionsFromExcel: jest.fn(),
  };

  const snackbarMock = {
    showError: jest.fn(),
  };

  const dialogMock = {
    open: jest.fn().mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(true)),
    }),
  };

  const dialogRefMock = {
    close: jest.fn(),
  };

  const mockValidationErrorService = { getErrorMessage: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ImportQuestionFormComponent],
      providers: [
        FormBuilder,
        { provide: QuestionPoolService, useValue: questionPoolServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: ValidationErrorService, useValue: mockValidationErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.clearAllMocks();
  });

  it('should create and initialize form', () => {
    component.ngOnInit();
    expect(component.uploadForm).toBeDefined();
    expect(component.uploadForm.get('file')).toBeDefined();
  });

  it('should download CSV file', () => {
    const linkMock = { href: '', download: '', click: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(linkMock as any);

    component.DownloadCsv();

    expect(linkMock.href).toBe('assets/templates/sampleCsv.csv');
    expect(linkMock.download).toBe('sampleCsv.csv');
    expect(linkMock.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('should download Excel file', () => {
    const linkMock = { href: '', download: '', click: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(linkMock as any);

    component.DownloadExcel();

    expect(linkMock.href).toBe('assets/templates/sampleExcel.xlsx');
    expect(linkMock.download).toBe('sampleExcel.xlsx');
    expect(linkMock.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('should fallback to "file" if fileUrl.split("/").pop() is empty', () => {
    const linkMock = { href: '', download: '', click: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(linkMock as any);

    (component as any).downloadFile('some/path/');

    expect(linkMock.href).toBe('some/path/');
    expect(linkMock.download).toBe('file');
    expect(linkMock.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('should set error on control for invalid file format', () => {
    const invalidFile = new File([''], 'invalid.txt', { type: 'text/plain' });
    const event = { target: { files: [invalidFile] } } as any;

    component.FileSelected(event);

    const control = component.uploadForm.get('file');
    expect(control?.errors).toEqual({ fileType: true });
    expect(control?.touched).toBe(true);
    expect(component.selectedFile).toBeNull();
  });

  it('should handle valid CSV file and open dialog', () => {
    const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });
    const event = { target: { files: [csvFile] } } as any;

    const mockQuestions = [{ id: 1, questionText: 'Test Question' }];
    questionPoolServiceMock.previewQuestionsFromCsv.mockReturnValue(of(mockQuestions));

    component.FileSelected(event);

    expect(component.selectedFile).toBe(csvFile);
    expect(questionPoolServiceMock.previewQuestionsFromCsv).toHaveBeenCalledWith(csvFile);
    expect(dialogMock.open).toHaveBeenCalledWith(
      ImportQuestionPreviewComponent,
      expect.objectContaining({
        data: mockQuestions,
      }),
    );
  });

  it('should handle valid Excel file and open dialog', () => {
    const excelFile = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const event = { target: { files: [excelFile] } } as any;
    const mockQuestions = [{ id: 1, questionText: 'Test Excel Question' }];

    questionPoolServiceMock.previewQuestionsFromExcel.mockReturnValue(of(mockQuestions));

    component.FileSelected(event);

    expect(questionPoolServiceMock.previewQuestionsFromExcel).toHaveBeenCalledWith(excelFile);
    expect(dialogMock.open).toHaveBeenCalledWith(
      ImportQuestionPreviewComponent,
      expect.objectContaining({
        data: mockQuestions,
      }),
    );
  });

  it('should show error when preview fails', () => {
    const csvFile = new File([''], 'test.csv', { type: 'text/csv' });
    const event = { target: { files: [csvFile] } } as any;

    questionPoolServiceMock.previewQuestionsFromCsv.mockReturnValue(
      throwError(() => ({ error: { message: 'Preview failed' } })),
    );

    component.FileSelected(event);

    expect(snackbarMock.showError).toHaveBeenCalledWith('Error', 'Preview failed');
  });

  it('should return correct displayFileName', () => {
    expect(component.displayFileName).toBe('No file chosen');

    const file = new File([''], 'myFile.csv');
    component.selectedFile = file;
    expect(component.displayFileName).toBe('myFile.csv');

    component.selectedFile = null;
    component.uploadForm.patchValue({ file: 'some/path/anotherFile.xlsx' });
    expect(component.displayFileName).toBe('anotherFile.xlsx');
  });

  it('should return "No file chosen" if form file string is empty', () => {
    component.selectedFile = null;
    component.uploadForm.patchValue({ file: '' });
    expect(component.displayFileName).toBe('No file chosen');
  });

  it('should clear selected file and reset input value when clearSelectedFile is called', () => {
    const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
    component.selectedFile = mockFile;
    component.uploadForm.patchValue({ file: mockFile });

    const mockInput = document.createElement('input');
    mockInput.type = 'file';

    component.clearSelectedFile(mockInput);
    expect(component.selectedFile).toBeNull();
    expect(component.uploadForm.get('file')?.value).toBeNull();
    expect(mockInput.value).toBe('');
  });

  it('should return "No file chosen" when no file is selected and control has no value', () => {
    component.selectedFile = null;
    component.uploadForm.get('file')?.setValue(null);

    expect(component.displayFileName).toBe('No file chosen');
  });

  it('should return null if control does not exist', () => {
    const result = component.getError('nonExistingField');
    expect(result).toBeNull();
  });

  it('should delegate to validationErrorService when control exists', () => {
    const control = component.uploadForm.get('file');
    control?.setErrors({ required: true });
    component.getError('file');

    expect(mockValidationErrorService.getErrorMessage).toHaveBeenCalledWith(
      control,
      component['fields'].find((f) => f.name === 'file')?.validationMessages ?? {},
      'file',
    );
  });
});
