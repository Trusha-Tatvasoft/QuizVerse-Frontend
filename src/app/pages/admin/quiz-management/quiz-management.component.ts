import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CardInputConfig } from '../../../shared/interfaces/card-component.interface';
import { CardComponent } from '../../../shared/components/card/card.component';
import { QuizManagementService } from '../../../services/admin/quiz-management/quiz-management.service';
import { Subject, takeUntil } from 'rxjs';
import { QuizManagementSummary } from './interfaces/quiz-management-summary.interface';
import { CardColor } from '../../../utils/types/card-component.type';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { MatSelectModule } from '@angular/material/select';
import {
  createNewQuizButtonConfig,
  quizManagementCardConfig,
  quizManagementHeaderConfig,
  searchInputConfig,
} from './configs/quiz-management.config';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-quiz-management',
  imports: [
    PageHeaderComponent,
    CardComponent,
    SearchInputComponent,
    MatSelectModule,
    FilledButtonComponent,
  ],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss',
})
export class QuizManagementComponent implements OnInit {
  private readonly destroy = new Subject<void>();

  // Inject services
  quizManagementService = inject(QuizManagementService);

  // Header and button configs
  quizConfig = quizManagementHeaderConfig;
  quizStatsConfigs: CardInputConfig[] = [];
  searchInputConfig = searchInputConfig;
  createNewQuizButtonConfig = createNewQuizButtonConfig;
  valueColor: CardColor = 'black';

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Filter selections
  selectedStatus: number;
  selectedCategory: number;
  selectedDifficulty: number;

  onSearchInputChange(value: string): void {}

  onFilterChange() {}

  ngOnInit(): void {
    this.quizManagementService
      .getQuizManagementStats()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          if (res.result && res.data) {
            this.quizStatsConfigs = this.mapQuizManagementStatsToCards(res.data);
          }
        },
        error: () => {
          this.quizStatsConfigs = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private mapQuizManagementStatsToCards(data: QuizManagementSummary): CardInputConfig[] {
    const quizManagementCards: CardInputConfig[] = [];

    for (const key in data) {
      const stat = data[key as keyof QuizManagementSummary];
      const config = quizManagementCardConfig[key as keyof QuizManagementSummary];

      quizManagementCards.push({
        title: config.title,
        value: stat,
        subtitle: '',
        valueColor: this.valueColor,
        subtitleColor: this.valueColor,
        icon: config.icon,
        iconColor: config.iconColor,
      });
    }

    return quizManagementCards;
  }
}
