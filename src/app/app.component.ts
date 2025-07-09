import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppColors } from './utils/constants';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';
  colors = AppColors;
}
