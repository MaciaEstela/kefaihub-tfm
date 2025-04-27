import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { User } from '../../../core/models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userAdminService: UserAdminService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userAdminService.getAll().subscribe((response) => {
      this.users = response.items;
    });
  }

  view(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }

  confirmDelete(userId: number): void {
    const confirmed = window.confirm(this.translate.instant('ADMIN.USERS.CONFIRM_DELETE'));
  
    if (confirmed) {
      this.userAdminService.delete(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.translate.get('ADMIN.USERS.SUCCESS.DELETE').subscribe(msg => alert(msg));
        },
        error: () => {
          this.translate.get('ADMIN.USERS.ERROR.DELETE').subscribe(msg => alert(msg));
        }
      });
    }
  }
}
