import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../../../models';

@Component({
  selector: 'app-team-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-delete-modal.html'
})
export class TeamDeleteModalComponent {
  @Input() show = false;
  @Input() team: Team | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}

