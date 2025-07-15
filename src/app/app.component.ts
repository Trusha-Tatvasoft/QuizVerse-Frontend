import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FilledButtonComponent } from './shared/components/filled-button/filled-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FilledButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';
}
