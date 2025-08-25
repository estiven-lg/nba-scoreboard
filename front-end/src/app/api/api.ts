 
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = 'http://localhost:5204/';

  constructor(private http: HttpClient) { }

  getDatos(): Observable<any> {
    console.log(this.http.get(`${this.baseUrl}api/games`))
    return this.http.get(`${this.baseUrl}api/games`);
  }


  getGameById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}api/games/${id}`);
  }
}
