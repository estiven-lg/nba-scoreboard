import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Team } from '@models/Team';
import { TeamWriteDto } from '@models/TeamWriteDto';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = `${environment.apiUrl}/api/teams`;

  constructor(private http: HttpClient) { }

  // ====================
  // 🏀 Team Management
  // ====================
  getTeams(search?: string): Promise<Team[]> {
    const url = search ? `${this.baseUrl}?search=${search}` : this.baseUrl;
    return firstValueFrom(this.http.get<Team[]>(url));
  }

  searchTeams(term: string): Promise<Team[]> {
    const url = term ? `${this.baseUrl}?search=${term}` : this.baseUrl;
    return firstValueFrom(this.http.get<Team[]>(url));
  }

  getTeamById(id: string | number): Promise<Team> {
    return firstValueFrom(this.http.get<Team>(`${this.baseUrl}/${id}`));
  }

  createTeam(team: TeamWriteDto): Promise<Team> {
    console.log(team);
    return firstValueFrom(this.http.post<Team>(this.baseUrl, team));
  }

  updateTeam(id: string | number, team: TeamWriteDto): Promise<Team> {
    return firstValueFrom(this.http.put<Team>(`${this.baseUrl}/${id}`, team));
  }

  deleteTeam(id: string | number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }

  trackByTeamId(index: number, team: any) {
    return team.teamId;
  }
}