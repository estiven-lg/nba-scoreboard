import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '@api/api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { differenceInMilliseconds, format, parse, parseISO } from 'date-fns';


@Component({
  selector: 'app-scoreboard',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.css'
})
export class Scoreboard implements OnInit, OnDestroy {
  @Input() homeScore: number = 103;
  @Input() awayScore: number = 102;
  @Input() period: number = 4;
  @Input() time: string = "01:26";
  @Input() homeFouls: number = 5;
  @Input() awayFouls: number = 4;
  @Input() player: number = 47;
  @Input() playerFoul: number = 5;
  @Input() homeTeamLogo: string = 'https://www.pngarts.com/files/12/Basketball-Team-Logo-Free-PNG-Image.png';
  @Input() awayTeamLogo: string = 'https://www.pngarts.com/files/12/Basketball-Team-Logo-Free-PNG-Image.png';

  private periodStartTime?: Date;
  private periodDurationMs: number = 12 * 60 * 1000; // 12 minutos en milisegundos
  private timerInterval?: any;

  constructor(private route: ActivatedRoute, private api: Api) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.game.getGameById(id).subscribe((data: any) => {
        this.homeScore = data.homeScore;
        this.awayScore = data.awayScore;
        this.period = data.currentPeriod;
        this.homeFouls = data.homeFouls || 0;
        this.awayFouls = data.awayFouls || 0;
        this.homeTeamLogo = data.homeTeam?.logoUrl || this.homeTeamLogo;
        this.awayTeamLogo = data.awayTeam?.logoUrl || this.awayTeamLogo;

        // Configurar el temporizador si hay periodStartTime
        if (data.periodStartTime) {
          this.periodStartTime = new  Date(data.periodStartTime + 'Z');
          this.startTimer();
        }
      });
    }
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  private updateTime(): void {
    if (!this.periodStartTime) return;

    const now = new Date();
    const elapsedMs = differenceInMilliseconds(now, this.periodStartTime);
    const remainingMs = this.periodDurationMs - elapsedMs;

    console.log(format(this.periodStartTime, 'HH:mm:ss'));
    console.log(format(now, 'HH:mm:ss'));

    if (remainingMs <= 0) {
      this.time = "00:00";
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      return;
    }

    const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
    const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

    this.time = `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
