 
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = `${environment.apiUrl}/api/`;

  constructor(private http: HttpClient) { }

  getDatos(): Observable<any> {
    
    return this.http.get(`${this.baseUrl}games`);
  }


  getGameById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}games/${id}`);
  }



    // ====================
    // ⚙️ Setup (Teams & Players)
    // ====================
    createTeam(team: any): Observable<any> {
      return this.http.post(`${this.baseUrl}teams`, team);
      console.log(team);
    }
  
    createPlayer(player: any): Observable<any> {
      return this.http.post(`${this.baseUrl}players`, player);
    }
  
    // ====================
    // 🏆 Game Flow
    // ====================
      getTeams(): Observable<any[]> {
          return this.http.get<any[]>(`${this.baseUrl}teams`);
      }
  
      createGame(payload: any): Observable<any> {
          return this.http.post(`${this.baseUrl}games`, payload);
      }

  
  
  
      startGame(gameId: string | number, periodSeconds: number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/start`, { periodSeconds });
      }
  
      pauseGame(gameId: string | number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/pause`, {});
      }
  
      resumeGame(gameId: string | number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/resume`, {});
      }
  
      resetPeriod(gameId: string | number, periodSeconds: number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/reset-period`, { periodSeconds });
      }
  
      nextPeriod(gameId: string | number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/next-period`, {});
      }
  
      suspendGame(gameId: string | number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/suspend`, {});
      }
  
      saveGame(gameId: string | number): Observable<any> {
          return this.http.post(`${this.baseUrl}games/${gameId}/save`, {});
      }
  
      getGameState(gameId: string | number): Observable<any> {
          return this.http.get(`${this.baseUrl}games/${gameId}`);
      }
  
      // 📥 Buscar partido existente por ID
      loadGameById(gameId: number): Observable<any> {
      return this.http.get(`${this.baseUrl}games/${gameId}`);
      }
  
      getFinalState(gameId: string | number): Observable<any> {
          return this.http.get(`${this.baseUrl}games/${gameId}`);
      }
  
      // Finalizar partido
      finishGame(gameId: string | number): Observable<any> {
      return this.http.post(`${this.baseUrl}games/${gameId}/finish`, {});
      }
  
    // ====================
    // ⛹️‍♂️ Scores & Fouls
    // ====================
    addPoints(gameId: string | number, team: 'home' | 'visitor', points: number): Observable<any> {
      return this.http.post(`${this.baseUrl}games/${gameId}/score/${team}`, { points });
    }
  
    addTeamFoul(gameId: string | number, teamId: number, period: number): Observable<any> {
      return this.http.post(`${this.baseUrl}games/${gameId}/fouls/team/${teamId}/inc?period=${period}`, {});
    }
  
    addPlayerFoul(gameId: string | number, playerId: number, period: number): Observable<any> {
      return this.http.post(`${this.baseUrl}games/${gameId}/fouls/player/${playerId}/inc?period=${period}`, {});
    }
  
    getPlayers(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}players`);
    }
  
    trackByPlayerId(index: number, player: any) {
      return player.playerId;
    }
  
}
