import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, CreateUserRequest, ApiResponse } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000';
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private tokenKey = 'farm-manager-token';
  private userKey = 'farm-manager-user';

  public user$ = this.userSubject.asObservable();
  public isLoading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem(this.userKey);
    
    if (token && savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
    this.loadingSubject.next(false);
  }

  private getHeaders(): HttpHeaders {
    const token = this.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log(response);
          
          localStorage.setItem(this.tokenKey, response.data.access_token);
          localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          this.userSubject.next(response.data.user);
        })
      );
  }

  createUser(user: CreateUserRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/register`, user, {
      headers: this.getHeaders()
    }).pipe(map(response => response.data));
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  canCreate(): boolean {
    const user = this.userSubject.getValue();
    return user?.role === "admin" || user?.role === "super_user";
  }

  canViewAll(): boolean {
    const user = this.userSubject.getValue();
    return user?.role === "admin" || user?.role === "super_user" || user?.role === "user";
  }

  logout(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}