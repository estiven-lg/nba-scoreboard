import { Routes } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';
import { ControlPanel } from './control-panel/control-panel';

export const routes: Routes = [
    { path: '', redirectTo: 'scoreboard', pathMatch: 'full' },
    { path: 'scoreboard', component: Scoreboard },
    { path: 'control-panel', component: ControlPanel },
    { path: '**', redirectTo: 'scoreboard' }
];
