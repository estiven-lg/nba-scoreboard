import { Routes } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { GameList } from './game-list/game-list';


export const routes: Routes = [
    { path: '', redirectTo: 'scoreboard', pathMatch: 'full' },
    { path: 'scoreboard', component: Scoreboard },
    { path: 'control-panel', component: ControlPanelComponent },
    { path: 'scoreboard/:id', component: Scoreboard },
    { path: 'control-panel', component: ControlPanelComponent },
    { path: 'games', component: GameList },
    { path: '**', redirectTo: 'scoreboard' }
];
