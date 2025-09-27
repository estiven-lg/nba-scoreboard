import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Player } from '@services/players.service';

@Component({
  selector: 'app-player-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-edit-modal.html'
})
export class PlayerEditModalComponent {
  @Input() show: boolean = false;
  @Input() player: Player | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NgForm>();

  onClose() {
    this.close.emit();
  }

  onSave(form: NgForm) {
    this.save.emit(form);
  }
}
