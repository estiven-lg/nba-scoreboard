import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Player } from '@models/Player';
import { Team } from '@models/Team';
import { Api } from '@api/api';

@Component({
  selector: 'app-player-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-edit-modal.html'
})
export class PlayerEditModalComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() player: Player | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NgForm>();

  teams: Team[] = [];

  constructor(private api: Api) { }

  ngOnInit() {
    this.api.team.getTeams().then(teams => {
      this.teams = teams;
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave(form: NgForm) {
    this.save.emit(form);
  }
}
