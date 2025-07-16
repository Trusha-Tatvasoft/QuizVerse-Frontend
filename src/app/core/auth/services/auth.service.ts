import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthResponse, LoginCredentials } from '../interfaces/login.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Dummy logic: check hardcoded user
    if (credentials.email === 'john@example.com' && credentials.password === 'password') {
      return of({ success: true, token: 'dummy-token' });
    } else {
      return of({ success: false, error: 'Invalid credentials' });
    }
  }
}
