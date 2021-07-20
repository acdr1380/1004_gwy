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
                    import('./salary-other-reduce-start/salary-other-reduce-start.module').then(
                        m => m.SalaryOtherReduceStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-other-reduce-manager/salary-other-reduce-manager.module').then(
                        m => m.SalaryOtherReduceManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-other-reduce-manager/salary-other-reduce-manager.module').then(
                        m => m.SalaryOtherReduceManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryOtherReduceModule {}
