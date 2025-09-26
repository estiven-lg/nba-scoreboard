import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PlayersService, Player, PlayerWriteDto } from '@services/players.service';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './players-list.html',
  styleUrls: ['./players-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PlayersListComponent implements OnInit {
  players = signal<Player[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  showDetailsModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  showCreateModal = signal(false);
  showSaveConfirmModal = signal(false);

  selectedPlayer = signal<Player | null>(null);
  tempEditedPlayer = signal<Player | null>(null);

  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.loadPlayers();
  }

  async loadPlayers() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      this.players.set(await this.playersService.getPlayers());
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }

async onConfirmSave() {
  if (this.tempEditedPlayer() && this.selectedPlayer()) {
    try {
      const updatedDto = this.mapToWriteDto(this.tempEditedPlayer()!);

      await this.playersService.updatePlayer(
        this.selectedPlayer()!.playerId,
        updatedDto
      );

      this.selectedPlayer.set(this.tempEditedPlayer());

      this.showSaveConfirmModal.set(false);
      this.showEditModal.set(false);
      this.showDetailsModal.set(true);

      this.loadPlayers();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}

cancelSaveConfirm() {
  this.showSaveConfirmModal.set(false);
  this.showEditModal.set(true);
}

  onSaveEdit(form: NgForm) {
    if (form.valid) {
      //this.showEditModal.set(false);
      this.showSaveConfirmModal.set(true);
    }
  }

async onConfirmDelete() {
  if (this.selectedPlayer()) {
    try {
      await this.playersService.deletePlayer(this.selectedPlayer()!.playerId);

      this.showDeleteModal.set(false);
      this.showDetailsModal.set(false);

      this.selectedPlayer.set(null);
      this.tempEditedPlayer.set(null);

      this.loadPlayers();
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}

  async onCreatePlayer(form: NgForm) {
    if (form.valid) {
      try {
        await this.playersService.createPlayer(form.value as PlayerWriteDto);
        this.closeModals();
        this.loadPlayers();
      } catch (e: any) {
        this.error.set(e.message);
      }
    }
  }

  openDetailsModal(player: Player) {
    this.selectedPlayer.set(player);
    this.showDetailsModal.set(true);
  }

  openEditModal() {
    this.showDetailsModal.set(false);
    this.showEditModal.set(true);
    if (this.selectedPlayer()) {
      this.tempEditedPlayer.set({ ...this.selectedPlayer()! });
    }
  }

  openDeleteModal() {
    this.showDetailsModal.set(false);
    this.showDeleteModal.set(true);
  }

  openCreateModal() {
    this.closeModals();
    this.showCreateModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedPlayer.set(null);
  }

  closeEditToDetails() {
    this.showEditModal.set(false);
    this.showDetailsModal.set(true);
    this.tempEditedPlayer.set(null);
  }

  closeDeleteToDetails() {
    this.showDeleteModal.set(false);
    this.showDetailsModal.set(true);
  }

  closeSaveToDetails() {
    this.showSaveConfirmModal.set(false);
    this.showDetailsModal.set(true);
  }

  closeModals() {
    this.showDetailsModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showCreateModal.set(false);
    this.showSaveConfirmModal.set(false);
    this.selectedPlayer.set(null);
    this.tempEditedPlayer.set(null);
  }
  
private mapToWriteDto(player: Player): PlayerWriteDto {
  return {
    fullName: player.fullName,
    jerseyNumber: player.jerseyNumber,
    position: player.position,
    teamId: player.teamId,
    height: player.height,
    age: player.age,
    nationality: player.nationality,
  };
}

onRowClick(player: Player) {
  // En móviles usamos click simple
  if (window.innerWidth < 640) { // breakpoint sm
    this.openDetailsModal(player);
  }
}

}
