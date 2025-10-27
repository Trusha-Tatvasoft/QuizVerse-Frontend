import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleCreationStep3Option3Component } from './battle-creation-step-3-option-3.component';
import { BattleManagementService } from '../../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { QuestionResponseDto } from '../../../../interfaces/battle-creation.interface';
import { platformMessages, quizCRUDMessages } from '../../../../../../../utils/constants';
import { EndPoints } from '../../../../../../../shared/enums/end-point.enum';

jest.mock('../../../../../../../services/admin/battle-management/battle-management.service');
jest.mock('../../../../../../../shared/service/snackbar/snackbar.service');

describe('BattleCreationStep3Option3Component', () => {
  let component: BattleCreationStep3Option3Component;
  let fixture: ComponentFixture<BattleCreationStep3Option3Component>;
  let battleManagementService: jest.Mocked<BattleManagementService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const mockQuestions: QuestionResponseDto[] = [
    {
      id: 1,
      categoryId: 1,
      queDifficultyId: 1,
      queText: 'What is 2+2?',
      queTypeId: 1,
      queOptionsAns: [
        { id: 1, questionId: 1, key: 'A', value: '4' },
        { id: 2, questionId: 1, key: 'B', value: '5' },
      ],
    },
    {
      id: 2,
      categoryId: 1,
      queDifficultyId: 2,
      queText: 'What is the capital of France?',
      queTypeId: 1,
      queOptionsAns: [
        { id: 3, questionId: 2, key: 'A', value: 'Paris' },
        { id: 4, questionId: 2, key: 'B', value: 'London' },
      ],
    },
  ];

  const mockApiResponse = {
    result: true,
    statusCode: 200,
    message: 'Success',
    data: mockQuestions,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BattleCreationStep3Option3Component,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatIconModule,
        OutlineButtonComponent,
      ],
      providers: [
        {
          provide: BattleManagementService,
          useValue: {
            getQuestionsFromCsv: jest.fn().mockReturnValue(of(mockApiResponse)),
            getQuestionsFromExcel: jest.fn().mockReturnValue(of(mockApiResponse)),
          },
        },
        {
          provide: SnackbarService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleCreationStep3Option3Component);
    component = fixture.componentInstance;
    battleManagementService = TestBed.inject(
      BattleManagementService,
    ) as jest.Mocked<BattleManagementService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render child components', () => {
    expect(fixture.debugElement.query(By.directive(OutlineButtonComponent))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(MatIcon))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('input[type="file"]'))).toBeTruthy();
  });

  it('should emit closeQuestionAdditionOption event when closeOption is called', () => {
    const spy = jest.spyOn(component.closeQuestionAdditionOption, 'emit');
    component.closeOption();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger file download for CSV', () => {
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    } as any);
    component.onDownloadCsv();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(document.createElement('a').click).toHaveBeenCalled();
    expect(document.createElement('a').href).toBe(EndPoints.DownloardSampleCsv);
    createElementSpy.mockRestore();
  });

  it('should trigger file download for Excel', () => {
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    } as any);
    component.onDownloadExcel();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(document.createElement('a').click).toHaveBeenCalled();
    expect(document.createElement('a').href).toBe(EndPoints.DownloardSampleExcel);
    createElementSpy.mockRestore();
  });

  it('should handle CSV file selection and add questions', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
    const file = new File([''], 'questions.csv', { type: 'text/csv' });
    const event = { target: { files: [file], value: '' } } as any;
    component.onFileSelected(event);
    expect(battleManagementService.getQuestionsFromCsv).toHaveBeenCalledWith(file);
    expect(component.selectedQuestions.length).toBe(2);
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, queText: 'What is 2+2?' }),
        expect.objectContaining({ id: 2, queText: 'What is the capital of France?' }),
      ]),
    );
    expect(snackbarService.showSuccess).toHaveBeenCalledWith('2 questions added!!');
    expect(event.target.value).toBe('');
  });

  it('should handle Excel file selection and add questions', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
    const file = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const event = { target: { files: [file], value: '' } } as any;
    component.onFileSelected(event);
    expect(battleManagementService.getQuestionsFromExcel).toHaveBeenCalledWith(file);
    expect(component.selectedQuestions.length).toBe(2);
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, queText: 'What is 2+2?' }),
        expect.objectContaining({ id: 2, queText: 'What is the capital of France?' }),
      ]),
    );
    expect(snackbarService.showSuccess).toHaveBeenCalledWith('2 questions added!!');
    expect(event.target.value).toBe('');
  });

  it('should show error for unsupported file types', () => {
    const file = new File([''], 'questions.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: '' } } as any;
    component.onFileSelected(event);
    expect(battleManagementService.getQuestionsFromCsv).not.toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromExcel).not.toHaveBeenCalled();
    expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.fileTypeError);
  });

  it('should not process if no file is selected', () => {
    const event = { target: { files: [], value: '' } } as any;
    component.onFileSelected(event);
    expect(battleManagementService.getQuestionsFromCsv).not.toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromExcel).not.toHaveBeenCalled();
    expect(snackbarService.showError).not.toHaveBeenCalled();
  });

  it('should handle CSV file drop and add questions', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
    const file = new File([''], 'questions.csv', { type: 'text/csv' });
    const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } } as any;
    component.fileDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromCsv).toHaveBeenCalledWith(file);
    expect(component.selectedQuestions.length).toBe(2);
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, queText: 'What is 2+2?' }),
        expect.objectContaining({ id: 2, queText: 'What is the capital of France?' }),
      ]),
    );
    expect(snackbarService.showSuccess).toHaveBeenCalledWith('2 questions added!!');
  });

  it('should handle Excel file drop and add questions', () => {
    const spy = jest.spyOn(component.selectedQuestionsChangeFromInnerStep3Option3, 'emit');
    const file = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } } as any;
    component.fileDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromExcel).toHaveBeenCalledWith(file);
    expect(component.selectedQuestions.length).toBe(2);
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, queText: 'What is 2+2?' }),
        expect.objectContaining({ id: 2, queText: 'What is the capital of France?' }),
      ]),
    );
    expect(snackbarService.showSuccess).toHaveBeenCalledWith('2 questions added!!');
  });

  it('should show error for unsupported file type on drop', () => {
    const file = new File([''], 'questions.txt', { type: 'text/plain' });
    const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } } as any;
    component.fileDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromCsv).not.toHaveBeenCalled();
    expect(battleManagementService.getQuestionsFromExcel).not.toHaveBeenCalled();
    expect(snackbarService.showError).toHaveBeenCalledWith(quizCRUDMessages.fileTypeError);
  });

  it('should prevent default behavior on dragover', () => {
    const event = { preventDefault: jest.fn() } as any;
    component.dragOver(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should show error on CSV file processing failure', () => {
    const error = { error: { message: 'Invalid CSV format' }, status: 400 };
    battleManagementService.getQuestionsFromCsv.mockReturnValueOnce(throwError(() => error));
    const file = new File([''], 'questions.csv', { type: 'text/csv' });
    const event = { target: { files: [file], value: '' } } as any;
    component.onFileSelected(event);

    expect(battleManagementService.getQuestionsFromCsv).toHaveBeenCalledWith(file);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Invalid CSV format',
    );
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should show error on Excel file processing failure', () => {
    const error = { error: { message: 'Invalid Excel format' }, status: 400 };
    battleManagementService.getQuestionsFromExcel.mockReturnValueOnce(throwError(() => error));
    const file = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const event = { target: { files: [file], value: '' } } as any;

    component.onFileSelected(event);

    expect(battleManagementService.getQuestionsFromExcel).toHaveBeenCalledWith(file);
    expect(snackbarService.showError).toHaveBeenCalledWith(
      platformMessages.errorTitle,
      'Invalid Excel format',
    );
    expect(component.selectedQuestions.length).toBe(0);
  });

  it('should correctly map QuestionResponseDto to QuestionsList', () => {
    const mappedQuestions = component['mapQuestions'](mockQuestions);
    expect(mappedQuestions.length).toBe(2);
    expect(mappedQuestions[0]).toEqual({
      id: 1,
      categoryId: 1,
      queDifficultyId: 1,
      queText: 'What is 2+2?',
      queTypeId: 1,
      queOptionsAns: [
        { id: 1, questionId: 1, key: 'A', value: '4' },
        { id: 2, questionId: 1, key: 'B', value: '5' },
      ],
    });
  });

  it('should handle empty data in mapQuestions', () => {
    const mappedQuestions = component['mapQuestions']([]);
    expect(mappedQuestions).toEqual([]);
  });

  it('should reset file input after selection', () => {
    const file = new File([''], 'questions.csv', { type: 'text/csv' });
    const event = { target: { files: [file], value: 'questions.csv' } } as any;
    component.onFileSelected(event);
    expect(event.target.value).toBe('');
  });

  it('should complete destroy$ subject on ngOnDestroy', () => {
    const spy = jest.spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
