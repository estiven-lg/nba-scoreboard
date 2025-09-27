import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-create-modal.html'
})
export class TeamCreateModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onCreate(form: any) {
    if (form.valid) {
      this.create.emit(form);
    }
  }
}