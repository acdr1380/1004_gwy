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
                    import('./salary-high-low-start/salary-high-low-start.module').then(
                        m => m.SalaryHighLowStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-high-low-manager/salary-high-low-manager.module').then(
                        m => m.SalaryHighLowManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-high-low-manager/salary-high-low-manager.module').then(
                        m => m.SalaryHighLowManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryHighLowModule {}
