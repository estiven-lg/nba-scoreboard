// filepath: /home/estiven/desarollo_web/nba-scoreboard/front-end/src/app/screens/team-list/components/team-save-confirm-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../../../models';

@Component({
  selector: 'app-team-save-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-save-confirm-modal.html'
})
export class TeamSaveConfirmModalComponent {
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