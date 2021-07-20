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
                loadChildren: () => import('./salary-civli-inner-transfer-start/salary-civli-inner-transfer-start.module').then(
                    m => m.SalaryCivliInnerTransferStartModule
                )
            },
            {
                path: 'manager',
                loadChildren: () => import('./salary-civli-inner-transfer-manager/salary-civli-inner-transfer-manager.module').then(
                    m => m.SalaryCivliInnerTransferManagerModule
                )
            },
            {
                path: 'leader',
                loadChildren: () => import('./salary-civli-inner-transfer-manager/salary-civli-inner-transfer-manager.module').then(
                    m => m.SalaryCivliInnerTransferManagerModule
                )
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivliInnerTransferModule { }
