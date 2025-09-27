import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Api } from '@api/api';
import { Team } from '@models/Team';

@Component({
  selector: 'app-player-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-create-modal.html'
})
export class PlayerCreateModalComponent implements OnInit {
  @Input() show: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<NgForm>();

  constructor(private api: Api) { }

  teams: Team[] = [];


  ngOnInit() {
    this.api.team.getTeams().then(teams => {
      this.teams = teams;
    });
  }

  onClose() {
    this.close.emit();
  }

  onCreate(form: NgForm) {
    this.create.emit(form);
  }
}
