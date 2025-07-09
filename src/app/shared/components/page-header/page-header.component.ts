import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  @Input() icon: string = 'edit';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() theme:
    | 'admin'
    | 'user'
    | 'quiz'
    | 'quizDifficulty'
    | 'queDifficulty'
    | 'email'
    | 'financial' = 'admin';
}
