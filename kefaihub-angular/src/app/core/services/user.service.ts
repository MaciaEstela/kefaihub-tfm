import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/o/headless-admin-user/v1.0';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCurrentUser(): Observable<User> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });

    return this.http.get<User>(`${this.apiUrl}/my-user-account`, { headers });
  }

  updateUser(user: User): Observable<User> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.patch<User>(
      `${this.apiUrl}/user-accounts/${user.id}`,
      user,
      { headers }
    );
  }

  updatePassword(userId: number, newPassword: string): Observable<void> {
    // TODO: CREATE A CUSTOM ENDPOINT FOR THIS

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      password: newPassword,
    };

    return this.http.put<void>(
      `${this.apiUrl}`,
      body,
      { headers }
    );
  }
}