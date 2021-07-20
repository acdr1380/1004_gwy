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
                    import('./salary-define-level-start/salary-define-level-start.module').then(
                        m => m.SalaryDefineLevelStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-define-level-manager/salary-define-level-manager.module').then(
                        m => m.SalaryDefineLevelManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-define-level-manager/salary-define-level-manager.module').then(
                        m => m.SalaryDefineLevelManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryDefineLevelModule {}
