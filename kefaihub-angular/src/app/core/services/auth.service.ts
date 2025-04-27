import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, switchMap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthUrl = 'http://localhost:8080/o/oauth2/token';
  private userUrl = 'http://localhost:8080/o/headless-admin-user/v1.0/my-user-account';
  private createUserUrl = 'http://localhost:8080/o/headless-admin-user/v1.0/user-accounts';

  private serviceAccountUsername = 'test@test.com';
  private serviceAccountPassword = '1234';

  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // OAuth2 client credentials (final user)
  private clientId = 'id-1adc9c6c-1417-b970-734a-529f4061234b';
  private clientSecret = 'secret-54b1b599-34ed-9891-7c58-88468952c063';

  constructor(private http: HttpClient) {}

  // Log in a user and retrieve an access token
  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(this.oauthUrl, body.toString(), { headers });
  }

  // Attempt to refresh the access token using a refresh token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('refresh_token', refreshToken);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(this.oauthUrl, body.toString(), { headers });
  }

  // Get the currently authenticated user data
  getUser(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    return this.http.get(this.userUrl, { headers });
  }

  // Register a new user
  register(userData: any): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', this.serviceAccountUsername)
      .set('password', this.serviceAccountPassword);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)
    });

    return this.http.post<any>(this.oauthUrl, body.toString(), { headers }).pipe(
      switchMap((response) => {
        const token = response.access_token;
        const authHeaders = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post(this.createUserUrl, userData, { headers: authHeaders }).pipe(
          catchError((err) => {
            console.error('Error while creating user:', err);
            if (err.error) {
              console.error('Liferay error message:', err.error);
            }
            return throwError(() => err);
          })
        );
      }),
      catchError((err) => {
        console.error('Error while obtaining service account token:', err);
        if (err.error) {
          console.error('Liferay error message:', err.error);
        }
        return throwError(() => err);
      })
    );
  }

  // Save tokens to localStorage and update login state
  saveToken(response: any): void {
    localStorage.setItem(this.accessTokenKey, response.access_token);
    if (response.refresh_token) {
      localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    }
    this.isLoggedInSubject.next(true);
  }

  // Get current access token
  getToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Log out and clear tokens
  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLoggedInSubject.next(false);
  }

  // Check if user is authenticated based on token expiration
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }
}