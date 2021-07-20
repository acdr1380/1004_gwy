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
                    import('./punishment-reduce-start/punishment-reduce-start.module').then(
                        m => m.PunishmentReduceStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./punishment-reduce-manager/punishment-reduce-manager.module').then(
                        m => m.PunishmentReduceManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./punishment-reduce-manager/punishment-reduce-manager.module').then(
                        m => m.PunishmentReduceManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryPunishmentReduceModule {}
