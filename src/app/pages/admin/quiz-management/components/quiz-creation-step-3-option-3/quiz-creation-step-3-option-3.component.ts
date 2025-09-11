import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  changeQuestionMethodButtonConfig,
  chooseFileButtonConfig,
  downloadCsvButtonConfig,
  downloadExelButtonConfig,
} from '../../configs/quiz-creation.config';
import { QuizCreationService } from '../../../../../services/admin/quiz-management/quiz-creation/quiz-creation.service';
import {
  QuestionOptionResponseDto,
  QuestionResponseDto,
  QuestionsList,
} from '../../../../../shared/interfaces/quiz-creation.interface';
import { SnackbarService } from '../../../../../shared/service/snackbar/snackbar.service';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { platformMessages, quizCRUDMessages } from '../../../../../utils/constants';
import { Subject, takeUntil } from 'rxjs';
import { EndPoints } from '../../../../../shared/enums/end-point.enum';

@Component({
  selector: 'app-quiz-creation-step-3-option-3',
  imports: [OutlineButtonComponent, MatIcon],
  templateUrl: './quiz-creation-step-3-option-3.component.html',
  styleUrl: './quiz-creation-step-3-option-3.component.scss',
})
export class QuizCreationStep3Option3Component {
  @Input() selectedQuestions: QuestionsList[] = [];
  @Output() selectedQuestionsChangeFromInnerStep3Option3 = new EventEmitter<QuestionsList[]>();
  @Output() closeQuestionAdditionOption = new EventEmitter();

  private readonly quizCreationService = inject(QuizCreationService);
  private readonly snackbar = inject(SnackbarService);

  changeMethodButton = changeQuestionMethodButtonConfig;
  downloadCsvButton = downloadCsvButtonConfig;
  downloadExelButton = downloadExelButtonConfig;
  chooseFileButton = chooseFileButtonConfig;

  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'file';
    link.click();
  }

  private handleSuccess(data: QuestionResponseDto[]) {
    const newSelectedQuestions = this.mapQuestions(data);
    this.selectedQuestions = [...this.selectedQuestions, ...newSelectedQuestions];
    this.selectedQuestionsChangeFromInnerStep3Option3.emit([...this.selectedQuestions]);
    this.snackbar.showSuccess(`${newSelectedQuestions.length} questions added!!`);
  }

  private mapQuestions(data: QuestionResponseDto[]): QuestionsList[] {
    return (data ?? []).map((q: QuestionResponseDto) => ({
      id: q.id,
      categoryId: q.categoryId,
      queDifficultyId: q.queDifficultyId,
      queText: q.queText,
      queTypeId: q.queTypeId,
      queOptionsAns: q.queOptionsAns.map((opt: QuestionOptionResponseDto) => ({
        id: opt.id,
        questionId: opt.questionId,
        key: opt.key,
        value: opt.value,
      })),
    }));
  }

  closeOption() {
    this.closeQuestionAdditionOption.emit();
  }

  fileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  //prevent default action oof browser on drag file
  dragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
    input.value = '';
  }

  handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      this.quizCreationService
        .getQuestionsFromCsv(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => this.handleSuccess(res.data),
          error: (err) => {
            const message = err?.error?.message || platformMessages.errorMessage;
            this.snackbar.showError(`${platformMessages.errorTitle} ${err.status}`, message);
          },
        });
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      this.quizCreationService
        .getQuestionsFromExcel(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => this.handleSuccess(res.data),
          error: (err) => {
            const message = err?.error?.message || platformMessages.errorMessage;
            this.snackbar.showError(`${platformMessages.errorTitle} ${err.status}`, message);
          },
        });
    } else {
      this.snackbar.showError(quizCRUDMessages.fileTypeError);
    }
  }

  onDownloadCsv() {
    this.downloadFile(`${EndPoints.DownloardSampleCsv}`);
  }

  onDownloadExcel() {
    this.downloadFile(`${EndPoints.DownloardSampleExcel}`);
  }
}
