import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import {
  addQuestionButtonConfig,
  questionPoolHeaderConfig,
  searchInputConfig,
} from './configs/question-pool.config';
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { QuestionPoolListingComponent } from './components/question-pool-listing/question-pool-listing.component';

@Component({
  selector: 'app-question-pool',
  imports: [
    PageHeaderComponent,
    SearchInputComponent,
    FilledButtonComponent,
    MatSelectModule,
    QuestionPoolListingComponent,
  ],
  templateUrl: './question-pool.component.html',
  styleUrl: './question-pool.component.scss',
})
export class QuestionPoolComponent {
  // Header and button configs
  questionPoolConfig = questionPoolHeaderConfig;
  searchInputConfig = searchInputConfig;
  addQuestionButtonConfig = addQuestionButtonConfig;

  // Search input control
  searchControl = new FormControl<string | null>(null);

  // Filter selections
  selectedCategory: number;
  selectedDifficulty: number;
  selectedType: number;

  onSearchInputChange(value: string): void {}

  onFilterChange() {}
}
