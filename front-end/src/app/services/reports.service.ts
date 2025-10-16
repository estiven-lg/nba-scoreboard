// front-end/src/app/services/reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = environment.reportsApiUrl ? `${environment.reportsApiUrl}` : '/reports';

  constructor(private http: HttpClient) { }

  /**
   * Descargar reporte de equipos en PDF
   * @returns Observable con el blob del PDF
   */
  downloadTeamsReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/teams`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body && response.headers.get('content-type')?.includes('application/pdf')) {
          return response.body;
        }
        throw new Error('Respuesta no es un PDF válido');
      })
    );
  }

  /**
   * Descargar reporte de jugadores de un equipo específico
   * @param teamId ID del equipo
   * @returns Observable con el blob del PDF
   */
  downloadTeamPlayersReport(teamId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/teams/${teamId}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body && response.headers.get('content-type')?.includes('application/pdf')) {
          return response.body;
        }
        throw new Error('Respuesta no es un PDF válido');
      })
    );
  }

  /**
   * Descargar reporte de juegos
   * @returns Observable con el blob del PDF
   */
  downloadGamesReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/games`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body && response.headers.get('content-type')?.includes('application/pdf')) {
          return response.body;
        }
        throw new Error('Respuesta no es un PDF válido');
      })
    );
  }

  /**
   * Descargar reporte de jugadores de un juego específico
   * @param gameId ID del juego
   * @returns Observable con el blob del PDF
   */
  downloadGamePlayersReport(gameId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/games/${gameId}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body && response.headers.get('content-type')?.includes('application/pdf')) {
          return response.body;
        }
        throw new Error('Respuesta no es un PDF válido');
      })
    );
  }

  /**
   * Utilidad para descargar un blob como archivo
   * @param blob Blob del archivo
   * @param filename Nombre del archivo
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}