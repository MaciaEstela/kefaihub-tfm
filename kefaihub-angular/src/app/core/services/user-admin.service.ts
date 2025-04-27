import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { RoleBrief, User, UserListResponse } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private apiUrl = 'http://localhost:8080/o/headless-admin-user/v1.0';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAll(): Observable<UserListResponse> {
    const headers = this.createAuthHeaders();
    return this.http.get<UserListResponse>(`${this.apiUrl}/user-accounts`, { headers });
  }

  getById(id: number): Observable<User> {
    const headers = this.createAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/user-accounts/${id}`, { headers });
  }

  update(id: number, user: Partial<User>): Observable<User> {
    const headers = this.createAuthHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<User>(`${this.apiUrl}/user-accounts/${id}`, user, { headers });
  }

  delete(id: number): Observable<void> {
    const headers = this.createAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/user-accounts/${id}`, { headers });
  }

  updatePassword(userId: number, newPassword: string): Observable<void> {
    const headers = this.createAuthHeaders({ 'Content-Type': 'application/json' });
    const body = { password: newPassword };
    return this.http.put<void>(`${this.apiUrl}/user-accounts/${userId}/password`, body, { headers });
  }

  getAllRoles(): Observable<RoleBrief[]> {
    const headers = this.createAuthHeaders();
    return this.http
      .get<{ items: RoleBrief[] }>(`${this.apiUrl}/roles`, { headers })
      .pipe(map(response => response.items));
  }

  assignRoleToUser(userId: number, roleExternalReferenceCode: string): Observable<void> {
    const headers = this.createAuthHeaders();
    const url = `${this.apiUrl}/roles/by-external-reference-code/${roleExternalReferenceCode}/association/user-account/${userId}`;
    return this.http.post<void>(url, {}, { headers });
  }

  removeRoleFromUser(userId: number, roleExternalReferenceCode: string): Observable<void> {
    const headers = this.createAuthHeaders();
    const url = `${this.apiUrl}/roles/by-external-reference-code/${roleExternalReferenceCode}/association/user-account/${userId}`;
    return this.http.delete<void>(url, { headers });
  }

  createUser(newUser: any): Observable<void> {
    const headers = this.createAuthHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<void>(`${this.apiUrl}/user-accounts`, newUser, { headers });
  }

  private createAuthHeaders(additionalHeaders: { [key: string]: string } = {}): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      ...additionalHeaders
    });
  }
}