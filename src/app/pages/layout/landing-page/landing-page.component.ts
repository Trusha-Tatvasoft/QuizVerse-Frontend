import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { OutlineButtonComponent } from '../../../shared/components/outline-button/outline-button.component';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  BROWSE_QUIZZES_BUTTON,
  FEATURES,
  JOIN_PLATFORM_BUTTON,
  LANDING_PAGE_CONTENT,
  START_PLAY_BUTTON,
} from '../configs/landing-page.component.config';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FilledButtonComponent, OutlineButtonComponent, MatIcon, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  landingPageContent = LANDING_PAGE_CONTENT;
  quizFeatures = FEATURES;
  startPlayButton = START_PLAY_BUTTON;
  browseQuizButton = BROWSE_QUIZZES_BUTTON;
  joinPlatFormButton = JOIN_PLATFORM_BUTTON;

  private readonly router = inject(Router);

  browseQuiz() {
    this.router.navigateByUrl('/');
  }

  playQuiz() {
    this.router.navigateByUrl('/');
  }
}
