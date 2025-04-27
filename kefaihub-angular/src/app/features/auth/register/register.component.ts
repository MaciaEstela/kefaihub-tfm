import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  givenName = '';
  familyName = '';
  emailAddress = '';
  password = '';
  alternateName = '';
  success = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  // Called when the registration form is submitted
  onRegister() {
    const newUser = {
      givenName: this.givenName,
      familyName: this.familyName,
      emailAddress: this.emailAddress,
      alternateName: this.alternateName,
      password: this.password,
    };

    this.authService.register(newUser).subscribe({
      next: () => {
        this.success = true;
        this.error = null;

        // Redirect to login after short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        console.error('Registration error:', err);

        if (err.status === 409) {
          this.error = this.translate.instant(
            'REGISTER.ERROR.CONFLICT_USERNAME'
          );
        } else if (err.status === 400 && err.error?.title) {
          this.error = err.error.title;
        } else {
          this.error = this.translate.instant('REGISTER.ERROR.GENERIC');
        }
      },
    });
  }
}