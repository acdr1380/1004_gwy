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
                    import('./salary-civil-high-low-start/salary-civil-high-low-start.module').then(
                        m => m.SalaryCivilHighLowStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-high-low-manager/salary-civil-high-low-manager.module'
                    ).then(m => m.SalaryCivilHighLowManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-high-low-manager/salary-civil-high-low-manager.module'
                    ).then(m => m.SalaryCivilHighLowManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilHighLowModule {}
