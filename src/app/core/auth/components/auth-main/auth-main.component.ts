import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { FilledButtonComponent } from '../../../../shared/components/filled-button/filled-button.component';
import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';

@Component({
  selector: 'app-auth-main',
  standalone: true,
  imports: [LoginComponent, FilledButtonComponent],
  templateUrl: './auth-main.component.html',
  styleUrls: ['./auth-main.component.scss'],
})
export class AuthMainComponent {
  googleButton: ButtonConfig = {
    label: 'Google',
    variant: 'secondary',
    fontWeight: 500,
  };

  facebookButton: ButtonConfig = {
    label: 'Facebook',
    variant: 'secondary',
    fontWeight: 500,
  };
}
