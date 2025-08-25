import { Routes } from '@angular/router';
import { Scoreboard } from './scoreboard/scoreboard';
import { ControlPanelComponent } from './control-panel/control-panel.component';

export const routes: Routes = [
    { path: '', redirectTo: 'scoreboard', pathMatch: 'full' },
    { path: 'scoreboard', component: Scoreboard },
    { path: 'control-panel', component: ControlPanelComponent },
    { path: '**', redirectTo: 'scoreboard' }
];
