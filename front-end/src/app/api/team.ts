import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = `${environment.apiUrl}/api/teams`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🏀 Team Management
  // ====================
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  createTeam(team: any): Observable<any> {
    console.log(team);
    return this.http.post(`${this.baseUrl}`, team);
  }

  getTeamById(id: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateTeam(id: string | number, team: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, team);
  }

  deleteTeam(id: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}