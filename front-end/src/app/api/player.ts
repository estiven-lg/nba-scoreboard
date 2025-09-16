import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private baseUrl = `${environment.apiUrl}/api/players`;

  constructor(private http: HttpClient) { }

  // ====================
  // ⛹️‍♂️ Player Management
  // ====================
  getPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  createPlayer(player: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, player);
  }

  getPlayerById(id: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updatePlayer(id: string | number, player: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, player);
  }

  deletePlayer(id: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  trackByPlayerId(index: number, player: any) {
    return player.playerId;
  }
}