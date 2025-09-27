import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Player } from '@models/Player';
import { PlayerWriteDto } from '@models/PlayerWriteDto';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private baseUrl = `${environment.apiUrl}/api/players`;

  constructor(private http: HttpClient) { }

  // ====================
  // ⛹️‍♂️ Player Management
  // ====================
  getPlayers(): Promise<Player[]> {
    return firstValueFrom(this.http.get<Player[]>(this.baseUrl));
  }

  updatePlayer(id: number, player: PlayerWriteDto): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.baseUrl}/${id}`, player));
  }

  deletePlayer(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  createPlayer(player: PlayerWriteDto): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.baseUrl, player));
  }

  trackByPlayerId(index: number, player: any) {
    return player.playerId;
  }
}