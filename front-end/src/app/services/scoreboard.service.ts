import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardService {
  private baseUrl = 'http://localhost:5204/api';
  private currentGameId: number | null = null;

  constructor(private http: HttpClient) {}

  // ====================
  // ⚙️ Setup (Teams & Players)
  // ====================
  createTeam(team: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/teams`, team);
    console.log(team);
  }

  createPlayer(player: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/players`, player);
  }

  // ====================
  // 🏆 Game Flow
  // ====================
    getTeams(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/teams`);
    }

    createGame(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/games`, payload);
    }

    setGameId(id: number) {
        this.currentGameId = id;
    }

    getGameId(): number | null {
        return this.currentGameId;
    }

    startGame(periodSeconds: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/start`, { periodSeconds });
    }

    pauseGame(): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/pause`, {});
    }

    resumeGame(): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/resume`, {});
    }

    resetPeriod(periodSeconds: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/reset-period`, { periodSeconds });
    }

    nextPeriod(): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/next-period`, {});
    }

    suspendGame(): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/suspend`, {});
    }

    saveGame(): Observable<any> {
        return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/save`, {});
    }

    getGameState(): Observable<any> {
        return this.http.get(`${this.baseUrl}/games/${this.currentGameId}`);
    }

    // 📥 Buscar partido existente por ID
    loadGameById(gameId: number): Observable<any> {
    this.currentGameId = gameId;
    return this.http.get(`${this.baseUrl}/games/${gameId}`);
    }

    getFinalState(): Observable<any> {
        return this.http.get(`${this.baseUrl}/games/${this.currentGameId}`);
    }

    // Finalizar partido
    finishGame(): Observable<any> {
    if (!this.currentGameId) return of(null);
    return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/finish`, {});
    }

  // ====================
  // ⛹️‍♂️ Scores & Fouls
  // ====================
  addPoints(team: 'home' | 'visitor', points: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/score/${team}`, { points });
  }

  addTeamFoul(teamId: number, period: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/fouls/team/${teamId}/inc?period=${period}`, {});
  }

  addPlayerFoul(playerId: number, period: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/games/${this.currentGameId}/fouls/player/${playerId}/inc?period=${period}`, {});
  }

  getPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/players`);
  }

  trackByPlayerId(index: number, player: any) {
    return player.playerId;
  }


}
