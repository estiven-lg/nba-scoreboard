import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-player-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-create-modal.html'
})
export class PlayerCreateModalComponent {
  @Input() show: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<NgForm>();

  onClose() {
    this.close.emit();
  }

  onCreate(form: NgForm) {
    this.create.emit(form);
  }
}
