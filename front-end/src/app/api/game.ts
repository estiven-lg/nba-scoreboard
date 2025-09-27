import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Game } from '@models/Game';
import { GameWriteDto } from '@models/GameWriteDto';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = `${environment.apiUrl}/api/games`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🎮 Game CRUD
  // ====================
  getGames(): Promise<Game[]> {
    return firstValueFrom(this.http.get<Game[]>(this.baseUrl));
  }

  getGameById(id: string): Promise<Game> {
    return firstValueFrom(this.http.get<Game>(`${this.baseUrl}/${id}`));
  }

  createGame(payload: GameWriteDto): Promise<Game> {
    return firstValueFrom(this.http.post<Game>(this.baseUrl, payload));
  }

  loadGameById(gameId: number): Promise<Game> {
    return firstValueFrom(this.http.get<Game>(`${this.baseUrl}/${gameId}`));
  }

  getGameState(gameId: string | number): Promise<Game> {
    return firstValueFrom(this.http.get<Game>(`${this.baseUrl}/${gameId}`));
  }

  getFinalState(gameId: string | number): Promise<Game> {
    return firstValueFrom(this.http.get<Game>(`${this.baseUrl}/${gameId}`));
  }

  // ====================
  // 🏆 Game Flow Control
  // ====================
  startGame(gameId: string | number, periodSeconds: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/start`, { periodSeconds }));
  }

  pauseGame(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/pause`, {}));
  }

  resumeGame(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/resume`, {}));
  }

  resetPeriod(gameId: string | number, periodSeconds: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/reset-period`, { periodSeconds }));
  }

  nextPeriod(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/next-period`, {}));
  }

  suspendGame(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/suspend`, {}));
  }

  saveGame(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/save`, {}));
  }

  finishGame(gameId: string | number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/finish`, {}));
  }

  // ====================
  // ⛹️‍♂️ Scores
  // ====================
  addPoints(gameId: string | number, team: 'home' | 'visitor', points: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/${gameId}/score/${team}`, { points }));
  }

  trackByGameId(index: number, game: any) {
    return game.gameId;
  }
}