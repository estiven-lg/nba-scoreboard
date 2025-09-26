import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Player {
  playerId: number;
  fullName: string;
  jerseyNumber: number;
  position: string;
  teamId: number;
  height: number;
  age: number;
  nationality: string;
}

export interface PlayerWriteDto {
  fullName: string;
  jerseyNumber: number;
  position: string;
  teamId: number;
  height: number;
  age: number;
  nationality: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private readonly apiUrl = 'http://localhost:5000/api/Players';

  constructor(private http: HttpClient) {}

  getPlayers(): Promise<Player[]> {
    return firstValueFrom(this.http.get<Player[]>(this.apiUrl));
  }

  updatePlayer(id: number, player: PlayerWriteDto): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/${id}`, player));
  }

  deletePlayer(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  createPlayer(player: PlayerWriteDto): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.apiUrl, player));
  }
}
