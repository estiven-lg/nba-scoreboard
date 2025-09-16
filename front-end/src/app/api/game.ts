import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = `${environment.apiUrl}/api/games`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🎮 Game CRUD
  // ====================
  getDatos(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getGameById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createGame(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  loadGameById(gameId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${gameId}`);
  }

  getGameState(gameId: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${gameId}`);
  }

  getFinalState(gameId: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${gameId}`);
  }

  // ====================
  // 🏆 Game Flow Control
  // ====================
  startGame(gameId: string | number, periodSeconds: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/start`, { periodSeconds });
  }

  pauseGame(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/pause`, {});
  }

  resumeGame(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/resume`, {});
  }

  resetPeriod(gameId: string | number, periodSeconds: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/reset-period`, { periodSeconds });
  }

  nextPeriod(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/next-period`, {});
  }

  suspendGame(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/suspend`, {});
  }

  saveGame(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/save`, {});
  }

  finishGame(gameId: string | number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/finish`, {});
  }

  // ====================
  // ⛹️‍♂️ Scores
  // ====================
  addPoints(gameId: string | number, team: 'home' | 'visitor', points: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/score/${team}`, { points });
  }
}