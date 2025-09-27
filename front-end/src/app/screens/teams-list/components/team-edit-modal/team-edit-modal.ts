import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team } from '../../../../models';

@Component({
  selector: 'app-team-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-edit-modal.html'
})
export class TeamEditModalComponent {
  @Input() show = false;
  @Input() team: Team | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onSave(form: any) {
    if (form.valid && this.team) {
      this.save.emit(form);
    }
  }
}