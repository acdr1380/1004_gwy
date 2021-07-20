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
                    import(
                        './salary-floating-change-start/salary-floating-change-start.module'
                    ).then(m => m.SalaryFloatingChangeStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-floating-change-manager/salary-floating-change-manager.module'
                    ).then(m => m.SalaryFloatingChangeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-floating-change-manager/salary-floating-change-manager.module'
                    ).then(m => m.SalaryFloatingChangeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryFloatingChangeModule {}
