import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TeamFoul } from '@models/TeamFoul';
import { PlayerFoul } from '@models/PlayerFoul';

@Injectable({
  providedIn: 'root'
})
export class FoulService {
  private baseUrl = `${environment.apiUrl}/api/`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🚨 Foul Management
  // ====================
  addTeamFoul(gameId: string | number, teamId: number, period: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}teamfouls/`, {
      gameId,
      teamId,
      period
    }));
  }

  addPlayerFoul(gameId: string | number, playerId: number, period: number): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}playerfouls/`, {
      gameId,
      playerId,
      period
    }));
  }

  // getTeamFouls(teamId: string | number): Promise<TeamFoul[]> {
  //   return firstValueFrom(this.http.get<TeamFoul[]>(`${environment.apiUrl}/api/teamfouls?teamId=${teamId}`));
  // }

  // getPlayerFouls(playerId: string | number): Promise<PlayerFoul[]> {
  //   return firstValueFrom(this.http.get<PlayerFoul[]>(`${environment.apiUrl}/api/playerfouls?playerId=${playerId}`));
  // }

  // trackByTeamFoulId(index: number, foul: any) {
  //   return foul.teamFoulId;
  // }

  // trackByPlayerFoulId(index: number, foul: any) {
  //   return foul.playerFoulId;
  // }
}