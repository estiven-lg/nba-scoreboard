import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RegisterResponse, 
  User 
} from '../models';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Iniciar sesión
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del login
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginRequest)
      .pipe(
        map(response => {
          // Guardar el usuario en localStorage y actualizar el subject
          const user: User = {
            id: response.id,
            email: response.email,
            token: response.token
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return response;
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registrar nuevo usuario
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del registro
   */
  register(email: string, password: string): Observable<RegisterResponse> {
    const registerRequest: RegisterRequest = { email, password };
    
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, registerRequest)
      .pipe(
        map(response => {
          console.log('Usuario registrado exitosamente:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    // Remover usuario del localStorage y actualizar el subject
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns true si está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    return user !== null && user.token !== undefined;
  }

  /**
   * Obtener el token de autenticación
   * @returns token si existe, null en caso contrario
   */
  getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
  }

  /**
   * Obtener información del usuario actual
   * @returns Usuario actual o null
   */
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
}
