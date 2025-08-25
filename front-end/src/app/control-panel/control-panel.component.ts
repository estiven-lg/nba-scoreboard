import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScoreboardService } from '../services/scoreboard.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../api/api';

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
  currentGameId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private scoreboardService: ScoreboardService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) { }

  get gameId() {
    return this.currentGameId;
  }

  get isNewGame() {
    return this.currentGameId === 'new';
  }



  ngOnInit(): void {
    // Capturar el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentGameId = id;
      // Solo cargar datos si NO es 'new'
      if (id !== 'new') {
        this.loadGameData(id);
      }
    }

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

  private loadGameData(gameId: string): void {
    this.api.getGameById(gameId).subscribe((data: any) => {
      this.gameState = data;
      this.currentQuarter = data.currentPeriod;
      this.existingGameId = data.gameId;

      // Actualizar el formulario con los datos del juego
      if (this.controlForm) {
        this.controlForm.patchValue({
          homeTeam: data.homeTeamId,
          visitorTeam: data.awayTeamId,
          gameStatus: data.gameStatus
        });
      }

      // Cargar jugadores de ambos equipos
      this.homePlayers = data.homeTeam?.players || [];
      this.visitorPlayers = data.awayTeam?.players || [];

      this.updateControlsByGameStatus();
    });
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
    this.api.getTeams().subscribe((res: any[]) => {
      this.homeTeams = res;
      this.visitorTeams = res;
    });
  }

  // ====================
  // ⚙️ Setup
  // ====================
  createTeam(name: string, city: string, logoUrl: string) {
    this.api.createTeam({ name, city, logoUrl }).subscribe();
  }

  createPlayer(teamId: number, jerseyNumber: number, fullName: string, position: string) {
    this.api.createPlayer({ teamId, jerseyNumber, fullName, position }).subscribe();
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

    
    this.api.createGame(payload).subscribe({
      next: (res: any) => {
        const gameId = res.gameId ?? res.id;
        
        // Actualizar el ID actual y navegar a la nueva URL
        this.currentGameId = gameId.toString();
        this.router.navigate(['/control-panel', gameId]);
        
        // Cargar los datos del juego recién creado
        this.loadGameData(gameId.toString());
        
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

    this.api.loadGameById(this.existingGameId).subscribe(res => {

      // this.api.setGameId(res.gameId);

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
    if (!this.currentGameId || this.gameState?.gameStatus === GameStatus.FINISHED) return;
    const seconds = this.controlForm.value.periodMinutes * 60;
    this.api.startGame(this.currentGameId, seconds).subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
    });
  }

  pauseGame() {
    if (!this.currentGameId) return;
    this.api.pauseGame(this.currentGameId).subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.PAUSED });
      this.updateControlsByGameStatus();
    });
  }

  resumeGame() {
    if (!this.currentGameId) return;
    this.api.resumeGame(this.currentGameId).subscribe(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  resetPeriod() {
    console.log(this.currentGameId);
    if (!this.currentGameId) return;
    const seconds = this.controlForm.value.periodMinutes * 60;
    this.api.resetPeriod(this.currentGameId, seconds).subscribe(() => {
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  nextQuarter() {
    if (!this.currentGameId) return;
    this.api.nextPeriod(this.currentGameId).subscribe(() => {
      if (this.currentQuarter < this.quartersTotal) this.currentQuarter++;
      this.cd.detectChanges(); // Refresca UI
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  suspendGame() {
    if (!this.currentGameId) return;
    this.api.finishGame(this.currentGameId).subscribe(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  finishGame() {
    if (!this.currentGameId) return;

    this.api.finishGame(this.currentGameId).subscribe(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  saveGame() {
    if (!this.currentGameId) return;
    this.api.saveGame(this.currentGameId).subscribe();
  }

  getFinalState() {
    if (!this.currentGameId) return;
    this.api.getFinalState(this.currentGameId).subscribe(res => {
      this.gameState = res;
      this.updateControlsByGameStatus();
    });
  }

  // ====================
  // ⛹️‍♂️ Scores & Fouls
  // ====================
  addPoints(team: 'home' | 'visitor', points: number) {
    if (!this.currentGameId) return;
    this.api.addPoints(this.currentGameId, team, points).subscribe(() => {
      this.getFinalState();
    });
  }

  addTeamFoul(team: 'home' | 'visitor') {
    if (!this.currentGameId) return;

    const teamId = team === 'home'
      ? this.controlForm.value.homeTeam
      : this.controlForm.value.visitorTeam;

    this.api.addTeamFoul(this.currentGameId, teamId, this.currentQuarter)
      .subscribe(res => {
        this.getFinalState();
      });
  }

  addPlayerFoul(playerId: number) {
    if (!this.currentGameId) return;

    this.api.addPlayerFoul(this.currentGameId, playerId, this.currentQuarter)
      .subscribe(() => {
        this.getFinalState();
      });
  }

  loadPlayers() {
    this.api.getPlayers().subscribe((res: any[]) => {
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

    this.api.getPlayers().subscribe(players => {
      this.homePlayers = players.filter(p => p.teamId === Number(homeId));
      this.visitorPlayers = players.filter(p => p.teamId === Number(visitorId));
      console.log('Home players:', this.homePlayers);
      console.log('Visitor players:', this.visitorPlayers);
    });
  }

}
