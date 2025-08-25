import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScoreboardService } from '../services/scoreboard.service';
import { FormsModule } from '@angular/forms';

enum GameStatus {
  NOT_STARTED = 0,
  RUNNING = 1,
  PAUSED = 2,
  FINISHED = 3,
  SUSPENDED = 4
}

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
})
export class ControlPanelComponent implements OnInit {
  controlForm!: FormGroup;
  currentQuarter = 1;
  quartersTotal = 4;
  homeTeams: any[] = [];
  visitorTeams: any[] = [];
  homePlayers: any[] = [];
  visitorPlayers: any[] = [];
  gameState: any = null;
  existingGameId: number | null = null;
  canInteract = true;
  GameStatus = GameStatus;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private scoreboardService: ScoreboardService,
    private cd: ChangeDetectorRef
  ) {}

  get gameId() {
    return this.scoreboardService.getGameId();
  }

  ngOnInit(): void {
    this.controlForm = this.fb.group({
      homeTeam: ['', Validators.required],
      visitorTeam: ['', Validators.required],
      periodMinutes: [10, [Validators.required, Validators.min(1)]],
      gameStatus: ['not-started'],
      homePlayer: [{ value: '', disabled: false }],
      visitorPlayer: [{ value: '', disabled: false }]
    });

    this.loadTeams();
  }

  getGameStatusName(status: number): string {
    switch (status) {
      case GameStatus.NOT_STARTED: return 'NOT_STARTED';
      case GameStatus.RUNNING: return 'RUNNING';
      case GameStatus.PAUSED: return 'PAUSED';
      case GameStatus.FINISHED: return 'FINISHED';
      case GameStatus.SUSPENDED: return 'SUSPENDED';
      default: return 'UNKNOWN';
    }
  }

  loadTeams() {
    this.scoreboardService.getTeams().subscribe((res: any[]) => {
      this.homeTeams = res;
      this.visitorTeams = res;
    });
  }

  // ====================
  // ⚙️ Setup
  // ====================
  createTeam(name: string, city: string, logoUrl: string) {
    this.scoreboardService.createTeam({ name, city, logoUrl }).subscribe();
  }

  createPlayer(teamId: number, jerseyNumber: number, fullName: string, position: string) {
    this.scoreboardService.createPlayer({ teamId, jerseyNumber, fullName, position }).subscribe();
  }

  // ====================
  // 🏆 Game Flow
  // ====================
  createGame() {
    this.errorMessage = null;

    const homeTeamId = this.controlForm.value.homeTeam;
    const visitorTeamId = this.controlForm.value.visitorTeam;

    // Validación: no permitir el mismo equipo
    if (homeTeamId === visitorTeamId) {
      this.errorMessage = 'El equipo local y visitante no pueden ser el mismo.';
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }

    const payload = {
      homeTeamId,
      awayTeamId: visitorTeamId,
      gameDate: new Date().toISOString()
    };

    this.scoreboardService.createGame(payload).subscribe({
      next: (res: any) => {
        const gameId = res.gameId ?? res.id;
        this.scoreboardService.setGameId(gameId);
        this.controlForm.patchValue({ gameStatus: 'created' });
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = 'Uno de los equipos ya tiene un partido en curso.';
        } else {
          console.error('Error al crear juego:', err);
          this.errorMessage = 'Ocurrió un error al crear el juego.';
        }
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  continueGame() {
    if (!this.existingGameId) return;

    this.scoreboardService.loadGameById(this.existingGameId).subscribe(res => {

      this.scoreboardService.setGameId(res.gameId);

      this.gameState = res;

      this.controlForm.patchValue({
        homeTeam: res.homeTeamId,
        visitorTeam: res.awayTeamId,
        gameStatus: res.gameStatus
      });

      this.homePlayers = res.homeTeam.players || [];
      this.visitorPlayers = res.awayTeam.players || [];
      this.currentQuarter = res.currentPeriod;

      this.updateControlsByGameStatus();
    });
  }

  updateControlsByGameStatus() {
    const status = this.gameState?.gameStatus;

    this.canInteract = status !== GameStatus.FINISHED;

    if (this.canInteract) {
      this.controlForm.get('homePlayer')?.enable();
      this.controlForm.get('visitorPlayer')?.enable();
    } else {
      this.controlForm.get('homePlayer')?.disable();
      this.controlForm.get('visitorPlayer')?.disable();
    }
  }


  startGame() {
    if (!this.gameId || this.gameState?.gameStatus === GameStatus.FINISHED) return;
    const seconds = this.controlForm.value.periodMinutes * 60;
    this.scoreboardService.startGame(seconds).subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
    });
  }

  pauseGame() {
    if (!this.gameId) return;
    this.scoreboardService.pauseGame().subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.PAUSED });
      this.updateControlsByGameStatus();
    });
  }

  resumeGame() {
    if (!this.gameId) return;
    this.scoreboardService.resumeGame().subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  resetPeriod() {
    if (!this.gameId) return;
    const seconds = this.controlForm.value.periodMinutes * 60;
    this.scoreboardService.resetPeriod(seconds).subscribe(() => {
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  nextQuarter() {
    if (!this.gameId) return;
    this.scoreboardService.nextPeriod().subscribe(() => {
      if (this.currentQuarter < this.quartersTotal) this.currentQuarter++;
      this.cd.detectChanges(); // Refresca UI
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  suspendGame() {
    if (!this.gameId) return;
    this.scoreboardService.finishGame().subscribe(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  finishGame() {
    if (!this.gameId) return;

    this.scoreboardService.finishGame().subscribe(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  saveGame() {
    if (!this.gameId) return;
    this.scoreboardService.saveGame().subscribe();
  }

  getFinalState() {
    if (!this.gameId) return;
    this.scoreboardService.getFinalState().subscribe(res => {
      this.gameState = res;
      this.updateControlsByGameStatus();
    });
  }

  // ====================
  // ⛹️‍♂️ Scores & Fouls
  // ====================
  addPoints(team: 'home' | 'visitor', points: number) {
    this.scoreboardService.addPoints(team, points).subscribe(() => {
      this.getFinalState();
    });
  }

  addTeamFoul(team: 'home' | 'visitor') {
    const teamId = team === 'home'
      ? this.controlForm.value.homeTeam
      : this.controlForm.value.visitorTeam;

    this.scoreboardService.addTeamFoul(teamId, this.currentQuarter)
      .subscribe(res => {
        this.getFinalState();
      });
  }

  addPlayerFoul(playerId: number) {
    this.scoreboardService.addPlayerFoul(playerId, this.currentQuarter)
      .subscribe(() => {
        this.getFinalState();
      });
  }

  loadPlayers() {
    this.scoreboardService.getPlayers().subscribe((res: any[]) => {
      // Filtrar por equipo seleccionado
      const homeTeamId = this.controlForm.value.homeTeam;
      const visitorTeamId = this.controlForm.value.visitorTeam;

      this.homePlayers = res.filter(p => p.teamId === homeTeamId);
      this.visitorPlayers = res.filter(p => p.teamId === visitorTeamId);
    });
  }

  trackByTeamId(index: number, team: any) {
    return team.teamId;
  }

  trackByPlayerId(index: number, player: any) {
    return player.playerId;
  }

  onTeamChange() {
    const homeId = this.controlForm.value.homeTeam;
    const visitorId = this.controlForm.value.visitorTeam;

    this.scoreboardService.getPlayers().subscribe(players => {
      this.homePlayers = players.filter(p => p.teamId === Number(homeId));
      this.visitorPlayers = players.filter(p => p.teamId === Number(visitorId));
      console.log('Home players:', this.homePlayers);
      console.log('Visitor players:', this.visitorPlayers);
    });
  }

}
