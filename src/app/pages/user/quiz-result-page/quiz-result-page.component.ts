import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { platformMessages } from '../../../utils/constants';
import { QuizResultHeaderComponent } from './components/quiz-result-header/quiz-result-header.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';

@Component({
  selector: 'app-quiz-result-page',
  imports: [QuizResultHeaderComponent],
  templateUrl: './quiz-result-page.component.html',
  styleUrl: './quiz-result-page.component.scss',
})
export class QuizResultPageComponent implements OnInit {
  decodedQuizId: number;
  private readonly snackbarService = inject(SnackbarService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.decodeRouteId();
  }

  decodeRouteId(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (!encodedId) return;

    try {
      const urlDecoded = decodeURIComponent(encodedId);
      const base64Decoded = atob(urlDecoded);
      const asNumber = Number(base64Decoded);

      if (!isNaN(asNumber)) {
        this.decodedQuizId = asNumber;
      } else {
        this.snackbarService.showError(platformMessages.errorTitle, platformMessages.invalidQuizId);
        this.decodedQuizId = 0;
      }
    } catch {
      this.snackbarService.showError(platformMessages.errorMessage, platformMessages.invalidQuizId);
      this.decodedQuizId = 0;
    }
  }
}
