import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScoreboardService } from '@services/scoreboard.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '@api/api';
import { Game } from '@models/Game';
import { Team } from '@models/index';
import { GameStatus } from '@models/GameStatus';



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
      visitorPlayer: [{ value: '', disabled: false }],
      gameDate: [new Date().toISOString().slice(0, 16), Validators.required] // Formato para input datetime-local
    });

    this.loadTeams();
  }

  private loadGameData(gameId: string): void {
    this.api.game.getGameById(gameId).then((data: Game) => {
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
      case GameStatus.NOT_STARTED: return 'Programado';
      case GameStatus.RUNNING: return 'En Juego';
      case GameStatus.PAUSED: return 'Pausado';
      case GameStatus.FINISHED: return 'Finalizado';
      case GameStatus.SUSPENDED: return 'Suspendido';
      default: return 'Desconocido';
    }
  }

  loadTeams() {
    this.api.team.getTeams().then((res: Team[]) => {
      this.homeTeams = res;
      this.visitorTeams = res;
    });
  }

  // ====================
  // ⚙️ Setup
  // ====================
  async createTeam(name: string, city: string, logoUrl: string) {
    await this.api.team.createTeam({ name, city, logoUrl });
  }

  async createPlayer(teamId: number, jerseyNumber: number, fullName: string, position: string) {
    await this.api.player.createPlayer({
      teamId, jerseyNumber, fullName, position,
      height: 0,
      age: 0,
      nationality: ''
    });
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.controlForm.patchValue({ gameDate: value });
  }

  // ====================
  // 🏆 Game Flow
  // ====================
  createGame() {
    this.errorMessage = null;

    const homeTeamId = this.controlForm.value.homeTeam;
    const awayTeamId = this.controlForm.value.visitorTeam;
    const gameDate = this.controlForm.value.gameDate;

    // Validación: no permitir el mismo equipo
    if (homeTeamId === awayTeamId) {
      this.errorMessage = 'El equipo local y visitante no pueden ser el mismo.';
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }

    const payload: any = {
      homeTeamId,
      awayTeamId,
      gameDate
    };

   

    this.api.game.createGame(payload).then((res: any) => {
      const gameId = res.gameId ?? res.id;

      // Actualizar el ID actual y navegar a la nueva URL
      this.currentGameId = gameId.toString();
      this.router.navigate(['/control-panel', gameId]);

      // Cargar los datos del juego recién creado
      this.loadGameData(gameId.toString());

      this.controlForm.patchValue({ gameStatus: 'created' });
    }).catch((err) => {
      if (err.status === 409) {
        this.errorMessage = 'Uno de los equipos ya tiene un partido en curso.';
      } else {
        console.error('Error al crear juego:', err);
        this.errorMessage = 'Ocurrió un error al crear el juego.';
      }
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => this.errorMessage = null, 5000);
    });
  }

  continueGame() {
    if (!this.existingGameId) return;

    this.api.game.loadGameById(this.existingGameId).then(res => {

      // this.api.setGameId(res.gameId);

      this.gameState = res;

      this.controlForm.patchValue({
        homeTeam: res.homeTeamId,
        visitorTeam: res.awayTeamId,
        gameStatus: res.gameStatus
      });

      // this.homePlayers = res.homeTeam.players || [];
      // this.visitorPlayers = res.awayTeam.players || [];
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
    this.api.game.startGame(this.currentGameId, seconds).then(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
    });
  }

  pauseGame() {
    if (!this.currentGameId) return;
    this.api.game.pauseGame(this.currentGameId).then(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.PAUSED });
      this.updateControlsByGameStatus();
    });
  }

  resumeGame() {
    if (!this.currentGameId) return;
    this.api.game.resumeGame(this.currentGameId).then(() => {
      this.controlForm.patchValue({ gameStatus: GameStatus.RUNNING });
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  resetPeriod() {
    console.log(this.currentGameId);
    if (!this.currentGameId) return;
    const seconds = this.controlForm.value.periodMinutes * 60;
    this.api.game.resetPeriod(this.currentGameId, seconds).then(() => {
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  nextQuarter() {
    if (!this.currentGameId) return;
    this.api.game.nextPeriod(this.currentGameId).then(() => {
      if (this.currentQuarter < this.quartersTotal) this.currentQuarter++;
      this.cd.detectChanges(); // Refresca UI
      this.getFinalState();
      this.updateControlsByGameStatus();
    });
  }

  suspendGame() {
    if (!this.currentGameId) return;
    this.api.game.finishGame(this.currentGameId).then(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  finishGame() {
    if (!this.currentGameId) return;

    this.api.game.finishGame(this.currentGameId).then(res => {
      this.gameState = res;
      this.controlForm.patchValue({ gameStatus: res.gameStatus });
      this.updateControlsByGameStatus();
    });
  }

  saveGame() {
    if (!this.currentGameId) return;
    this.api.game.saveGame(this.currentGameId).then();
  }

  getFinalState() {
    if (!this.currentGameId) return;
    this.api.game.getFinalState(this.currentGameId).then(res => {
      this.gameState = res;
      this.updateControlsByGameStatus();
    });
  }

  // ====================
  // ⛹️‍♂️ Scores & Fouls
  // ====================
  addPoints(team: 'home' | 'visitor', points: number) {
    if (!this.currentGameId) return;
    this.api.game.addPoints(this.currentGameId, team, points).then(() => {
      this.getFinalState();
    });
  }

  addTeamFoul(team: 'home' | 'visitor') {
    if (!this.currentGameId) return;

    const teamId = team === 'home'
      ? this.controlForm.value.homeTeam
      : this.controlForm.value.visitorTeam;

    this.api.foul.addTeamFoul(this.currentGameId, teamId, this.currentQuarter)
      .then(res => {
        this.getFinalState();
      });
  }

  addPlayerFoul(playerId: number) {
    if (!this.currentGameId) return;

    this.api.foul.addPlayerFoul(this.currentGameId, playerId, this.currentQuarter)
      .then(() => {
        this.getFinalState();
      });
  }

  loadPlayers() {
    this.api.player.getPlayers().then((res: any[]) => {
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

    this.api.player.getPlayers().then(players => {
      this.homePlayers = players.filter(p => p.teamId === Number(homeId));
      this.visitorPlayers = players.filter(p => p.teamId === Number(visitorId));
      console.log('Home players:', this.homePlayers);
      console.log('Visitor players:', this.visitorPlayers);
    });
  }

}
