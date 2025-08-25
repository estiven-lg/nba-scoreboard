import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';
import { ControlPanelComponent } from './control-panel/control-panel.component'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Scoreboard, ControlPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nba-scoreboard');
}
