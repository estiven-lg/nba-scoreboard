import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '@api/api';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '@models/index';

@Component({
  selector: 'app-game-list',
  imports: [DatePipe, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './game-list.html',
  styleUrl: './game-list.css'
})
export class GameList {

  games: Game[] = [];
  filteredGames: Game[] = [];
  searchTerm: string = '';
  statusFilter: string = '';

  constructor(private api: Api, private router: Router) { }
  ngOnInit(): void {
    this.loadGames();
  }

  // Métodos de navegación
  irAScoreboard(id: number): void {
    this.router.navigate(['/scoreboard', id]);
  }

  irAControlPanel(id: number): void {
    this.router.navigate(['/control-panel', id]);
  }

  crearNuevoJuego(): void {
    this.router.navigate(['/control-panel', 'new']);
  }

  // Métodos de datos
  loadGames(): void {
    this.api.game.getGames().then((games: Game[]) => {
      this.games = games || [];
      this.filteredGames = [...this.games];
    }).catch(error => {
      console.error('Error loading games:', error);
      this.games = [];
      this.filteredGames = [];
    });
  }

  refreshGames(): void {
    this.loadGames();
  }

  // Métodos de filtrado y búsqueda
  filterGames(): void {
    let filtered = [...this.games];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.homeTeam?.name?.toLowerCase().includes(searchLower) ||
        game.awayTeam?.name?.toLowerCase().includes(searchLower) ||
        game.homeTeam?.city?.toLowerCase().includes(searchLower) ||
        game.awayTeam?.city?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (this.statusFilter) {
      filtered = filtered.filter(game => game.gameStatus === this.statusFilter);
    }

    this.filteredGames = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.filteredGames = [...this.games];
  }

  // Métodos de conteo para estadísticas
  getActiveGamesCount(): number {
    return this.games.filter(game => this.isLiveGame(game.gameStatus)).length;
  }

  getFinishedGamesCount(): number {
    return this.games.filter(game => game.gameStatus === 'FINISHED').length;
  }

  getScheduledGamesCount(): number {
    return this.games.filter(game => game.gameStatus === 'SCHEDULED').length;
  }

  // Métodos de utilidad para la UI
  trackByGameId(index: number, game: Game): number {
    return game.gameId;
  }

  isLiveGame(status: string): boolean {
    return status === 'LIVE' || status === 'IN_PROGRESS' || status === 'ACTIVE';
  }

  isWinning(teamScore: number, opponentScore: number): boolean {
    return teamScore > opponentScore && teamScore > 0;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'LIVE':
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'bg-red-500 text-white animate-pulse';
      case 'FINISHED':
        return 'bg-green-500 text-white';
      case 'SCHEDULED':
        return 'bg-yellow-500 text-white';
      case 'SUSPENDED':
        return 'bg-orange-500 text-white';
      case 'CANCELLED':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  }

  getGameStatusText(status: string): string {
    switch (status) {
      case 'LIVE':
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'En Vivo';
      case 'FINISHED':
        return 'Finalizado';
      case 'SCHEDULED':
        return 'Programado';
      case 'SUSPENDED':
        return 'Suspendido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getPeriodDuration(game: Game): string {
    // Aquí podrías calcular la duración real basada en el período actual
    const periodMinutes = 12; // NBA standard
    return `${periodMinutes}min`;
  }

  getScoreDifference(game: Game): string {
    const homeScore = game.homeScore || 0;
    const awayScore = game.awayScore || 0;
    const diff = Math.abs(homeScore - awayScore);
    return diff === 0 ? 'Empate' : `±${diff}`;
  }

  onImageError(event: any): void {
    // Fallback para imágenes que no cargan
    event.target.src = '/assets/basketball.png';
  }

  deleteGame(gameId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este partido?')) {
      // Nota: Esta función requiere que se implemente deleteGame en el GameService
      // Por ahora, mostraremos un mensaje de funcionalidad no disponible
      console.warn('Delete game functionality not implemented in API service');
      alert('Funcionalidad de eliminar partido no implementada aún.');
      
      // Cuando se implemente en el API service, descomentar:
      /*
      this.api.game.deleteGame(gameId).then(() => {
        this.loadGames(); // Recargar la lista después de eliminar
      }).catch((error: any) => {
        console.error('Error deleting game:', error);
        alert('Error al eliminar el partido. Intenta de nuevo.');
      });
      */
    }
  }

}
