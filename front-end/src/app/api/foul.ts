import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FoulService {
  private baseUrl = `${environment.apiUrl}/api/games`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🚨 Foul Management
  // ====================
  addTeamFoul(gameId: string | number, teamId: number, period: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/fouls/team/${teamId}/inc?period=${period}`, {});
  }

  addPlayerFoul(gameId: string | number, playerId: number, period: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${gameId}/fouls/player/${playerId}/inc?period=${period}`, {});
  }

  getTeamFouls(teamId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/teamfouls?teamId=${teamId}`);
  }

  getPlayerFouls(playerId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/playerfouls?playerId=${playerId}`);
  }
}