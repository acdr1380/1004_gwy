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
                        './salary-civil-define-level-start/salary-civil-define-level-start.module'
                    ).then(m => m.SalaryCivilDefineLevelStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-define-level-manager/salary-civil-define-level-manager.module'
                    ).then(m => m.SalaryCivilDefineLevelManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-define-level-manager/salary-civil-define-level-manager.module'
                    ).then(m => m.SalaryCivilDefineLevelManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilDefineLevelModule {}
