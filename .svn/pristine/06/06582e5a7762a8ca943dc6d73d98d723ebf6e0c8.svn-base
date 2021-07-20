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
                    import(
                        './salary-civil-allowance-change-start/salary-civil-allowance-change-start.module'
                    ).then(m => m.SalaryCivilAllowanceChangeStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-allowance-change-manager/salary-civil-allowance-change-manager.module'
                    ).then(m => m.SalaryCivilAllowanceChangeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-allowance-change-manager/salary-civil-allowance-change-manager.module'
                    ).then(m => m.SalaryCivilAllowanceChangeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilAllowanceChangeModule {}
