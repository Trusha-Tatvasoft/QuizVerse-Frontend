import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * PageHeaderComponent
 * --------------------
 * Reusable header card component that displays an icon, title, and subtitle.
 * The appearance changes based on the provided `theme`.
 */
@Component({
  selector: 'app-page-header',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  /** Icon to display in the header (e.g., 'edit', 'mail', 'settings') */
  @Input() icon: string = 'edit';

  /** Title text to show in the header */
  @Input() title: string = '';

  /** Subtitle or descriptive text */
  @Input() subtitle: string = '';

  /** Theme to apply to the header card (controls color and background) */
  @Input() theme:
    | 'admin'
    | 'user'
    | 'quiz'
    | 'quizDifficulty'
    | 'queDifficulty'
    | 'email'
    | 'financial' = 'admin';
}
