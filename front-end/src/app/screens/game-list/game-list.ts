import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '@api/api';
import { CommonModule, DatePipe } from '@angular/common';
import { Game } from '@models/index';

@Component({
  selector: 'app-game-list',
  imports: [DatePipe, CommonModule],
  standalone: true,
  templateUrl: './game-list.html',
  styleUrl: './game-list.css'
})
export class GameList {

  games: any[] = [];

  constructor(private api: Api, private router: Router) { }
  irAScoreboard(id: number) {
    this.router.navigate(['/scoreboard', id]);
  }

  irAControlPanel(id: number) {
    this.router.navigate(['/control-panel', id]);
  }

  crearNuevoJuego() {
    this.router.navigate(['/control-panel', 'new']);
  }

  ngOnInit(): void {
    this.api.game.getGames().then((games: Game[]) => {
      this.games = games;
    });
  }

}
