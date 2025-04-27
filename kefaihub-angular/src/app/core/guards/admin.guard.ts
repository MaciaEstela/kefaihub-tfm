import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          const isAdmin = user.roleBriefs?.some(role => role.name === 'Administrator');
          if (!isAdmin) {
            this.router.navigate(['/']);
            return resolve(false);
          }
          return resolve(true);
        },
        error: () => {
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}
