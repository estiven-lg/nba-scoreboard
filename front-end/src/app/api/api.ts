import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameService } from './game';
import { TeamService } from './team';
import { PlayerService } from './player';
import { FoulService } from './foul';

@Injectable({
  providedIn: 'root'
})
export class Api {


  constructor(
    private http: HttpClient,
    public game: GameService,
    public team: TeamService,
    public player: PlayerService,
    public foul: FoulService
  ) { }

}
