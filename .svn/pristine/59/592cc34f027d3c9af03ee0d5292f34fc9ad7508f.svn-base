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
                    import('./rank-rise-start/rank-rise-start.module').then(
                        m => m.SalaryRankRiseStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./rank-rise-manager/rank-rise-manager.module').then(
                        m => m.SalaryRankRiseManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./rank-rise-manager/rank-rise-manager.module').then(
                        m => m.SalaryRankRiseManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryRankRiseModule {}
