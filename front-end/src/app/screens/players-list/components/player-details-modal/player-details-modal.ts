import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '@services/players.service';

@Component({
  selector: 'app-player-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-details-modal.html'
})
export class PlayerDetailsModalComponent {
  @Input() show: boolean = false;
  @Input() player: Player | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}
