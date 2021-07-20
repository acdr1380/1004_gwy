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
                loadChildren: () => import('./salaryl-initialize-start/salary-initialize-start.module').then(
                    m => m.SalaryInitializeStartModule
                )
            },
            {
                path: 'manager',
                loadChildren: () => import('./salary-initialize-manager/salary-initialize-manager.module').then(
                    m => m.SalaryInitializeManagerModule
                )
            },
            {
                path: 'leader',
                loadChildren: () => import('./salary-initialize-manager/salary-initialize-manager.module').then(
                    m => m.SalaryInitializeManagerModule
                )
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryInitializeModule { }
