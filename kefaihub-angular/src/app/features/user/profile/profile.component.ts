import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  password: string = '';
  confirmPassword: string = '';
  message: string | null = null;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const token = this.authService.getToken();
    if (token) {
      this.userService.getCurrentUser().subscribe({
        next: (data: User) => {
          this.user = data;
        },
        error: () => {
          this.error = this.translate.instant('PROFILE.ERROR.LOAD');
        },
      });
    }
  }

  updateUser(): void {
    if (!this.user) return;

    this.userService.updateUser(this.user).subscribe({
      next: () => {
        this.message = this.translate.instant('PROFILE.SUCCESS.UPDATE');
        this.error = null;
      },
      error: () => {
        this.message = null;
        this.error = this.translate.instant('PROFILE.ERROR.UPDATE');
      },
    });
  }

  updatePassword(): void {
    if (!this.user) return;

    if (this.password !== this.confirmPassword) {
      this.error = this.translate.instant('PROFILE.ERROR.PASSWORD_MATCH');
      return;
    }

    this.userService.updatePassword(this.user.id, this.password).subscribe({
      next: () => {
        this.message = this.translate.instant('PROFILE.SUCCESS.PASSWORD');
        this.error = null;
        this.password = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.message = null;
        this.error = this.translate.instant('PROFILE.ERROR.PASSWORD');
      },
    });
  }
}