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
                        './salary-civil-level-rise-start/salary-civil-level-rise-start.module'
                    ).then(m => m.SalaryCivilLevelRiseStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-level-rise-manager/salary-civil-level-rise-manager.module'
                    ).then(m => m.SalaryCivilLevelRiseManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-level-rise-manager/salary-civil-level-rise-manager.module'
                    ).then(m => m.SalaryCivilLevelRiseManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilLevelRiseModule {}
