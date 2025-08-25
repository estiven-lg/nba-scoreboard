import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../api/api';
import { CommonModule, DatePipe } from '@angular/common';

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

  ngOnInit(): void {
    this.api.getDatos().subscribe((games:any) => {
      console.log(games);
      this.games = games;
    });
  }

}
