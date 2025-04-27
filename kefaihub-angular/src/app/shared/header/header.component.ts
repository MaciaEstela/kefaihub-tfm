import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;
  selectedLang: string = 'ca';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('lang');
    this.selectedLang = savedLang ?? 'ca';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;

      if (loggedIn) {
        const token = this.authService.getToken();
        if (token) {
          this.userService.getCurrentUser().subscribe({
            next: (user) => {
              this.username = `${user.givenName} ${user.familyName}`;
              this.roles = user.roleBriefs?.map(r => r.name) || [];
            },
            error: () => {
              this.username = null;
              this.roles = [];
            },
          });
        }
      } else {
        this.username = null;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  registre(): void {
    this.router.navigate(['/registre']);
  }

  changeLanguage(lang: string): void {
    this.selectedLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  isAdmin(): boolean {
    return this.roles.includes('Administrator');
  }
  
  isModerator(): boolean {
    return this.roles.includes('Moderator');
  }
}