import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'start', pathMatch: 'full' },
            {
                path: 'start',
                loadChildren: () =>
                    import('./civil-punishment-reduce-start/civil-punishment-reduce-start.module').then(
                        m => m.CivilPunishmentReduceStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./civil-punishment-reduce-manager/civil-punishment-reduce-manager.module').then(
                        m => m.CivilPunishmentReduceManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./civil-punishment-reduce-manager/civil-punishment-reduce-manager.module').then(
                        m => m.CivilPunishmentReduceManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilPunishmentReduceModule {}
