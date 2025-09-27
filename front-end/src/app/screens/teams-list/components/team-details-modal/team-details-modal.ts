import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../../../models';

@Component({
  selector: 'app-team-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-details-modal.html'
})
export class TeamDetailsModalComponent {
  @Input() show = false;
  @Input() team: Team | null = null;
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