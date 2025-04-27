import { Component } from '@angular/core';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-new',
  templateUrl: './user-new.component.html'
})
export class UserNewComponent {
  givenName = '';
  familyName = '';
  emailAddress = '';
  alternateName = '';
  password = '';
  confirmPassword = '';
  error: string | null = null;
  success: string | null = null;

  constructor(
    private userAdminService: UserAdminService,
    private router: Router,
    private translate: TranslateService
  ) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = this.translate.instant('ADMIN.USERS.ERROR.PASSWORD_MATCH');
      return;
    }

    const newUser = {
      givenName: this.givenName,
      familyName: this.familyName,
      emailAddress: this.emailAddress,
      alternateName: this.alternateName,
      password: this.password
    };

    this.userAdminService.createUser(newUser).subscribe({
      next: () => {
        this.success = this.translate.instant('ADMIN.USERS.SUCCESS.CREATED');
        setTimeout(() => this.router.navigate(['/admin/users']), 2500);
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.USERS.ERROR.CREATE');
      }
    });
  }
}
