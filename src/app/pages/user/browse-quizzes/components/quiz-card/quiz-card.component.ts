import { Component, computed, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../../../shared/components/tag/tag.component';
import { FilledButtonComponent } from '../../../../../shared/components/filled-button/filled-button.component';
import { MatIconModule } from '@angular/material/icon';
import { TagInputConfig } from '../../../../../shared/interfaces/tag-component.interface';
import { QuizListComponent } from '../quiz-list/quiz-list.component';
import { Router } from '@angular/router';
import { Navigations } from '../../../../../shared/enums/navigation';
import { QuizCardConfig } from '../../interfaces/browsr-quiz-request.interface';
import { reportQuizButtonConfig } from '../../configs/browse-quizzes.config';
import { OutlineButtonComponent } from '../../../../../shared/components/outline-button/outline-button.component';
import { ReportQuizDialogComponent } from '../report-quiz-dialog/report-quiz-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowseQuizzesComponent } from '../../browse-quizzes.component';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [
    CommonModule,
    TagComponent,
    FilledButtonComponent,
    MatIconModule,
    OutlineButtonComponent,
    MatTooltipModule,
  ],
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.scss'],
})
export class QuizCardComponent {
  private readonly quizList = inject(QuizListComponent);
  private readonly browseQuizzesComponent = inject(BrowseQuizzesComponent);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  reportQuizBtn = reportQuizButtonConfig;

  btnDisable = signal(false);
  cardStyle = computed(() => this.quizList.cardStyle());

  @Input() cardConfig!: QuizCardConfig;

  ngOnChanges() {
    this.setReportButtonConfig();
  }

  displayTags = computed<TagInputConfig[]>(() => {
    const tags = this.cardConfig?.tags ?? [];
    if (tags.length <= 3) {
      return tags;
    }

    return [
      ...tags.slice(0, 3),
      {
        id: 'extra',
        label: `+${tags.length - 3} more`,
        type: 'static',
        isSelected: false,
        hasBorder: false,
        backgroundColor: 'lightPurple',
        textColor: 'black',
      } as TagInputConfig,
    ];
  });

  quizBtnClick() {
    const encodedId = btoa(this.cardConfig.id.toString());

    if (this.cardConfig.isAttempted) {
      // redirect to quiz result
      this.router.navigate([
        Navigations.User,
        Navigations.QuizList,
        Navigations.BrowseQuizzes,
        Navigations.QuizResult,
        encodedId,
      ]);
    } else {
      // redirect to quiz play
      this.router.navigate([
        Navigations.User,
        Navigations.QuizList,
        Navigations.BrowseQuizzes,
        Navigations.QuizInstruction,
        encodedId,
      ]);
    }
  }

  openReportDialog() {
    const dialogref = this.dialog.open(ReportQuizDialogComponent, {
      minWidth: '30vw',
      maxWidth: '100vw',
      data: {
        quizId: this.cardConfig.id,
        quizTitle: this.cardConfig.title,
        reason: this.cardConfig?.report?.reportReason || '',
        reportId: this.cardConfig?.report?.reportId || 0,
        isEditMode: !!this.cardConfig?.report?.reportId,
      },
    });

    dialogref.componentInstance.reportSubmitted.subscribe((isReported: boolean) => {
      if (isReported) {
        this.browseQuizzesComponent.batchNumber = 1;
        this.browseQuizzesComponent.fetchQuizzesList(true);
      }
    });
  }

  private setReportButtonConfig() {
    this.reportQuizBtn = { ...reportQuizButtonConfig };

    const report = this.cardConfig?.report;

    if (this.cardConfig?.isAttempted && report && report.reportId > 0) {
      this.reportQuizBtn.isDisabled = !report.isEditable;
      this.btnDisable.set(true);
    }
  }
}
