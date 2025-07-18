import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginSignupComponent } from './core/auth/components/login-signup/login-signup.component';
import { LoginComponent } from './core/auth/components/login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginSignupComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'QuizVerse-Frontend';
}
