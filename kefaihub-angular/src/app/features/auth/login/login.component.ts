import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  user: any;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  // Called when the login form is submitted
  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.access_token) {
          this.authService.saveToken(response);
          this.getUserInfo();
          this.router.navigate(['/']);
        } else {
          this.error = this.translate.instant('LOGIN.ERROR.NO_TOKEN');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.error = this.translate.instant('LOGIN.ERROR.INVALID');
        } else {
          this.error = this.translate.instant('LOGIN.ERROR.GENERIC');
        }
      },
    });
  }

  // Load user profile info after successful login
  getUserInfo() {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getUser(token).subscribe({
        next: (userData) => {
          this.user = userData;
          this.error = null;
        },
        error: (err) => {
          console.error('Login error:', err);
          this.error = this.translate.instant('LOGIN.ERROR.GENERIC');
        },
      });
    }
  }
}