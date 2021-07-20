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
                    import('./salary-post-change-start/salary-post-change-start.module').then(
                        m => m.SalaryPostChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-post-change-manager/salary-post-change-manager.module').then(
                        m => m.SalaryPostChangeManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-post-change-manager/salary-post-change-manager.module').then(
                        m => m.SalaryPostChangeManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryPostChangeModule {}
