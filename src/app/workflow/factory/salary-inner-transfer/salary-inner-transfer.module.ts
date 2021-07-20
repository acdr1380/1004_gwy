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
                    import('./salary-inner-transfer-start/salary-inner-transfer-start.module').then(
                        m => m.SalaryInnerTransferStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-inner-transfer-manager/salary-inner-transfer-manager.module'
                    ).then(m => m.SalaryInnerTransferManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-inner-transfer-manager/salary-inner-transfer-manager.module'
                    ).then(m => m.SalaryInnerTransferManagerModule),
            },
        ],
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    declarations: [],
})
export class SalaryInnerTransferModule {}
