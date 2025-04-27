import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { RoleBrief, User } from '../../../core/models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  password: string = '';
  confirmPassword: string = '';
  message: string | null = null;
  error: string | null = null;
  allRoles: RoleBrief[] = [];
  selectedRoleCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userAdminService: UserAdminService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.userAdminService.getById(id).subscribe((user) => (this.user = user));
      this.userAdminService.getAllRoles().subscribe({
        next: (roles) => {
          this.allRoles = roles.filter((role) =>
            role.name.toLowerCase().includes('kefaihub')
          );
        },
        error: () => {
          this.error = this.translate.instant('ADMIN.USERS.ERROR.ROLE_LOAD');
        },
      });
    }
  }

  assignRole(): void {
    if (this.user && this.selectedRoleCode) {
      this.userAdminService
        .assignRoleToUser(this.user.id, this.selectedRoleCode)
        .subscribe({
          next: () => {
            this.message = this.translate.instant(
              'ADMIN.USERS.SUCCESS.ROLE_ADDED'
            );
            this.ngOnInit();
          },
          error: () => {
            this.error = this.translate.instant('ADMIN.USERS.ERROR.ROLE_ADD');
          },
        });
    }
  }

  updateUser(): void {
    if (!this.user) return;

    this.userAdminService.update(this.user.id, this.user).subscribe({
      next: () => {
        this.message = this.translate.instant('ADMIN.USERS.SUCCESS.UPDATE');
        this.error = null;
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.USERS.ERROR.UPDATE');
        this.message = null;
      },
    });
  }

  updatePassword(): void {
    if (!this.user) return;

    if (this.password !== this.confirmPassword) {
      this.error = this.translate.instant('ADMIN.USERS.ERROR.PASSWORD_MATCH');
      return;
    }

    this.userAdminService.updatePassword(this.user.id, this.password).subscribe({
      next: () => {
        this.message = this.translate.instant('ADMIN.USERS.SUCCESS.PASSWORD');
        this.error = null;
        this.password = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.USERS.ERROR.PASSWORD');
        this.message = null;
      },
    });
  }

  getFilteredRoles(): RoleBrief[] {
    return (
      this.user?.roleBriefs?.filter((role) =>
        role.name.toLowerCase().includes('kefaihub')
      ) || []
    );
  }

  removeRole(code: string): void {
    if (!this.user) return;

    this.userAdminService.removeRoleFromUser(this.user.id, code).subscribe({
      next: () => {
        this.message = this.translate.instant(
          'ADMIN.USERS.SUCCESS.ROLE_REMOVED'
        );
        this.ngOnInit();
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.USERS.ERROR.ROLE_REMOVE');
      },
    });
  }
}