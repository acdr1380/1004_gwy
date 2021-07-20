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
                loadChildren: () => import('./salary-civil-initialize-start/salary-civil-initialize-start.module').then(
                    m => m.SalaryCivilInitializeStartModule
                )
            },
            {
                path: 'manager',
                loadChildren: () => import('./salary-civil-initialize-manager/salary-civil-initialize-manager.module').then(
                    m => m.SalaryCivilInitializeManagerModule
                )
            },
            {
                path: 'leader',
                loadChildren: () => import('./salary-civil-initialize-manager/salary-civil-initialize-manager.module').then(
                    m => m.SalaryCivilInitializeManagerModule
                )
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilInitializeModule { }
