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
                    import('./allowance-change-start/allowance-change-start.module').then(
                        m => m.AllowanceChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./allowance-change-manager/allowance-change-manager.module').then(
                        m => m.AllowanceChangeManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./allowance-change-manager/allowance-change-manager.module').then(
                        m => m.AllowanceChangeManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryAllowanceChangeModule { }
