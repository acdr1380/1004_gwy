import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'start', pathMatch: 'full' },
            {
                path: 'start',
                loadChildren: () =>
                    import('./salary-death-start/salary-death-start.module').then(
                        m => m.SalaryDeathStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-death-manager/salary-death-manager.module').then(
                        m => m.SalaryDeathManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-death-manager/salary-death-manager.module').then(
                        m => m.SalaryDeathManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryDeathModule {}
