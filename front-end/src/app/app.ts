import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Scoreboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nba-scoreboard');
}
