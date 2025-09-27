import { Routes } from '@angular/router';
import { Scoreboard } from '@screens/scoreboard/scoreboard';
import { ControlPanelComponent } from '@screens/control-panel/control-panel.component';
import { GameList } from '@screens/game-list/game-list';
import { PlayersListComponent } from '@screens/players-list/players-list';

import { PlayersList } from '@screens/players-list/players-list';
import { AuthGuard } from './guards/auth.guard';
import { Login } from '@screens/login/login';

export const routes: Routes = [
    { path: '', redirectTo: 'games', pathMatch: 'full' },
    { path: 'login', component: Login },
    // { path: 'register', component: RegisterComponent },
    { path: 'scoreboard/:id', component: Scoreboard },
    { path: 'control-panel/:id', component: ControlPanelComponent, canActivate: [AuthGuard] },
    { path: 'games', component: GameList },
    { path: 'players', component: PlayersListComponent },
    { path: '**', redirectTo: 'games' }
];
