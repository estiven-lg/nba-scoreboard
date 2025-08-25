import { Routes } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';
import { ControlPanel } from './control-panel/control-panel';
import { GameList } from './game-list/game-list';


export const routes: Routes = [
    { path: '', redirectTo: 'scoreboard', pathMatch: 'full' },
    { path: 'scoreboard/:id', component: Scoreboard },
    { path: 'control-panel', component: ControlPanel },
    { path: 'games', component: GameList },
    { path: '**', redirectTo: 'scoreboard' }
];
