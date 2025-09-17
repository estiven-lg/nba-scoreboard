import { Routes } from '@angular/router';
import { Scoreboard } from '@screens/scoreboard/scoreboard';
import { ControlPanelComponent } from '@screens/control-panel/control-panel.component';
import { GameList } from '@screens/game-list/game-list';


export const routes: Routes = [
    { path: '', redirectTo: 'games', pathMatch: 'full' },
    { path: 'scoreboard/:id', component: Scoreboard },
    { path: 'control-panel/:id', component: ControlPanelComponent },
    { path: 'games', component: GameList },
    { path: '**', redirectTo: 'games' }
];
