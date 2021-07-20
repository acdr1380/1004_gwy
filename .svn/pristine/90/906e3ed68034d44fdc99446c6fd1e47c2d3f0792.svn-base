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
                loadChildren: () => import('./salary-two-year-rise-start/salary-two-year-rise-start.module').then(m => m.SalaryTwoYearRiseStartModule),
            },
            {
                path: 'manager',
                loadChildren: () => import('./salary-two-year-rise-manager/salary-two-year-rise-manager.module').then(m => m.SalaryTwoYearRiseManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () => import('./salary-two-year-rise-manager/salary-two-year-rise-manager.module').then(m => m.SalaryTwoYearRiseManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryTwoYearRiseModule { }
