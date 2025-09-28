import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { Team, TeamWriteDto } from '../../models';
import {
  TeamDetailsModalComponent,
  TeamEditModalComponent,
  TeamDeleteModalComponent,
  TeamCreateModalComponent,
  TeamSaveConfirmModalComponent
} from './components';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TeamDetailsModalComponent,
    TeamEditModalComponent,
    TeamDeleteModalComponent,
    TeamCreateModalComponent,
    TeamSaveConfirmModalComponent
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.css'
})
export class TeamsListComponent implements OnInit {
  // Signals
  teams = signal<Team[]>([]);
  selectedTeam = signal<Team | null>(null);
  tempEditedTeam = signal<Team | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal states
  showDetailsModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  showCreateModal = signal(false);
  showSaveConfirmModal = signal(false);
  searchTerm = signal<string>('');


  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  async makeSearch() {

    const term: string = this.searchTerm().trim();
    this.loading.set(true);
    this.error.set(null);
    try {
      const teams = await this.api.team.searchTeams(term);
      this.teams.set(teams);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }

  }

  constructor(private api: Api) { }

  async ngOnInit() {
    await this.loadTeams();
  }

  // Data operations
  async loadTeams() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const teams = await this.api.team.getTeams();
      this.teams.set(teams);
    } catch (error) {
      console.error('Error loading teams:', error);
      this.error.set('Error al cargar los equipos');
    } finally {
      this.loading.set(false);
    }
  }

  // Modal controls
  openDetailsModal(team: Team) {
    this.selectedTeam.set(team);
    this.showDetailsModal.set(true);
  }

  openEditModal() {
    const team = this.selectedTeam();
    if (team) {
      this.tempEditedTeam.set({ ...team });
      this.showEditModal.set(true);
    }
  }

  openDeleteModal() {
    this.showDeleteModal.set(true);
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedTeam.set(null);
  }

  closeEditToDetails() {
    this.showEditModal.set(false);
    this.tempEditedTeam.set(null);
  }

  closeDeleteToDetails() {
    this.showDeleteModal.set(false);
  }

  closeModals() {
    this.showDetailsModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showCreateModal.set(false);
    this.showSaveConfirmModal.set(false);
    this.selectedTeam.set(null);
    this.tempEditedTeam.set(null);
  }

  closeSaveToDetails() {
    this.showSaveConfirmModal.set(false);
  }

  // CRUD operations
  async onCreateTeam(form: any) {
    try {
      if (!form.valid) return;

      const teamData: TeamWriteDto = {
        name: form.value.name,
        city: form.value.city || null,
        logoUrl: form.value.logoUrl || null
      };

      await this.api.team.createTeam(teamData);
      await this.loadTeams();
      this.closeModals();
    } catch (error) {
      console.error('Error creating team:', error);
      this.error.set('Error al crear el equipo');
    }
  }

  async onSaveEdit(form: any) {
    try {
      if (!form.valid) return;

      const team = this.selectedTeam();
      if (!team) return;

      const teamData: TeamWriteDto = {
        name: form.value.name,
        city: form.value.city || null,
        logoUrl: form.value.logoUrl || null
      };

      await this.api.team.updateTeam(team.teamId, teamData);
      await this.loadTeams();
      this.closeModals();
    } catch (error) {
      console.error('Error updating team:', error);
      this.error.set('Error al actualizar el equipo');
    }
  }

  async onConfirmDelete() {
    try {
      const team = this.selectedTeam();
      if (!team) return;

      await this.api.team.deleteTeam(team.teamId);
      await this.loadTeams();
      this.closeModals();
    } catch (error) {
      console.error('Error deleting team:', error);
      this.error.set('Error al eliminar el equipo');
    }
  }

  onConfirmSave() {
    // Implementation for save confirmation if needed
    this.closeSaveToDetails();
  }

  // Utility methods
  trackByTeamId(index: number, team: Team): number {
    return team.teamId;
  }

  clearError() {
    this.error.set(null);
  }
}
