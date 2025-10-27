import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { OutlineButtonComponent } from '../../../../../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import {
  QueOptionsAndAnswers,
  QuestionResponseDto,
  QuestionsList,
} from '../../../../interfaces/battle-creation.interface';
import { BattleManagementService } from '../../../../../../../services/admin/battle-management/battle-management.service';
import { SnackbarService } from '../../../../../../../shared/service/snackbar/snackbar.service';
import {
  changeQuestionMethodButtonConfig,
  chooseFileButtonConfig,
  downloadCsvButtonConfig,
  downloadExelButtonConfig,
} from '../../../../../quiz-management/configs/quiz-creation.config';
import { Subject, takeUntil } from 'rxjs';
import { platformMessages, quizCRUDMessages } from '../../../../../../../utils/constants';
import { EndPoints } from '../../../../../../../shared/enums/end-point.enum';

@Component({
  selector: 'app-battle-creation-step-3-option-3',
  imports: [OutlineButtonComponent, MatIcon],
  templateUrl: './battle-creation-step-3-option-3.component.html',
  styleUrl: './battle-creation-step-3-option-3.component.scss',
})
export class BattleCreationStep3Option3Component {
  @Input() selectedQuestions: QuestionsList[] = []; // Input: questions already selected in parent component
  @Output() selectedQuestionsChangeFromInnerStep3Option3 = new EventEmitter<QuestionsList[]>(); // Output: notify parent when questions are updated
  @Output() closeQuestionAdditionOption = new EventEmitter(); // Output: notify parent to close this option UI

  // Button configs
  changeMethodButton = changeQuestionMethodButtonConfig;
  downloadCsvButton = downloadCsvButtonConfig;
  downloadExelButton = downloadExelButtonConfig;
  chooseFileButton = chooseFileButtonConfig;

  // Inject services
  private readonly battleManagementService = inject(BattleManagementService);
  private readonly snackbar = inject(SnackbarService);

  // Used for unsubscribing observables on destroy
  private readonly destroy$ = new Subject<void>();

  // Emit event to close option panel
  closeOption() {
    this.closeQuestionAdditionOption.emit();
  }

  // Handle drag & drop file upload
  fileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  // Prevent default browser action when dragging file
  dragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Handle file selected from input element
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
    input.value = ''; // reset input
  }

  // Handle different file types (CSV, Excel) and call respective service methods
  handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      this.battleManagementService
        .getQuestionsFromCsv(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => this.handleSuccess(res.data),
          error: (err) => {
            this.snackbar.showError(
              platformMessages.errorTitle,
              err?.error?.message || platformMessages.errorMessage,
            );
          },
        });
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      this.battleManagementService
        .getQuestionsFromExcel(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => this.handleSuccess(res.data),
          error: (err) => {
            this.snackbar.showError(
              platformMessages.errorTitle,
              err?.error?.message || platformMessages.errorMessage,
            );
          },
        });
    } else {
      // Show error if unsupported file type
      this.snackbar.showError(quizCRUDMessages.fileTypeError);
    }
  }

  // Download sample CSV template
  onDownloadCsv() {
    this.downloadFile(`${EndPoints.DownloardSampleCsv}`);
  }

  // Download sample Excel template
  onDownloadExcel() {
    this.downloadFile(`${EndPoints.DownloardSampleExcel}`);
  }

  // Clean up observables when component is destroyed
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Trigger browser download for given file URL
  private downloadFile(fileUrl: string) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'file';
    link.click();
  }

  // Handle API success response and update selected questions
  private handleSuccess(data: QuestionResponseDto[]) {
    const newSelectedQuestions = this.mapQuestions(data);
    this.selectedQuestions = [...this.selectedQuestions, ...newSelectedQuestions];
    this.selectedQuestionsChangeFromInnerStep3Option3.emit([...this.selectedQuestions]);
    this.snackbar.showSuccess(`${newSelectedQuestions.length} questions added!!`);
  }

  // Map API response DTO to QuestionsList format
  private mapQuestions(data: QuestionResponseDto[]): QuestionsList[] {
    return (data ?? []).map((q: QuestionResponseDto) => ({
      id: q.id,
      categoryId: q.categoryId,
      queDifficultyId: q.queDifficultyId,
      queText: q.queText,
      queTypeId: q.queTypeId,
      queOptionsAns: q.queOptionsAns.map((opt: QueOptionsAndAnswers) => ({
        id: opt.id,
        questionId: opt.questionId,
        key: opt.key,
        value: opt.value,
      })),
    }));
  }
}
