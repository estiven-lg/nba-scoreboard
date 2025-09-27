import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '@services/players.service';

@Component({
  selector: 'app-player-save-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-save-confirm-modal.html'
})
export class PlayerSaveConfirmModalComponent {
  @Input() show: boolean = false;
  @Input() player: Player | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
