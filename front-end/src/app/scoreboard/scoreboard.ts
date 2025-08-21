import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-scoreboard',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.css'
})
export class Scoreboard {
  @Input() homeScore: number = 103;
  @Input() awayScore: number = 102;
  @Input() period: number = 4;
  @Input() time: string = "01:26";
  @Input() homeFouls: number = 5;
  @Input() awayFouls: number = 4;
  @Input() player: number = 47;
  @Input() playerFoul: number = 5;
  @Input() homeTeamLogo: string = 'https://www.pngarts.com/files/12/Basketball-Team-Logo-Free-PNG-Image.png';
  @Input() awayTeamLogo: string = 'https://www.pngarts.com/files/12/Basketball-Team-Logo-Free-PNG-Image.png'
}
