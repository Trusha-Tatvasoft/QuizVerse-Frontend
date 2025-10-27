import { Component, inject, signal } from '@angular/core';
import { questionFormDialogTabConfig } from '../../configs/question-pool-tab-config';
import { TabComponent } from '../../../../../shared/components/tab/tab.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CreateEditQuestionFormComponent } from '../manual-question-tab/components/create-edit-question-form/create-edit-question-form.component';

@Component({
  selector: 'app-question-form-dialog',
  imports: [TabComponent, MatDialogModule, MatIconModule, CreateEditQuestionFormComponent],
  templateUrl: './question-form-dialog.component.html',
  styleUrl: './question-form-dialog.component.scss',
})
export class QuestionFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<QuestionFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  mode = this.data?.mode || 'create';

  tabs = questionFormDialogTabConfig;
  selectedIndex = signal(0);

  switchToTab(index: number) {
    this.selectedIndex.set(index);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
