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
                    import('./salary-level-rise-start/salary-level-rise-start.module').then(
                        m => m.SalaryPostChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-level-rise-manager/salary-level-rise-manager.module').then(
                        m => m.SalaryLevelRiseManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-level-rise-manager/salary-level-rise-manager.module').then(
                        m => m.SalaryLevelRiseManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryLevelRiseModule {}
