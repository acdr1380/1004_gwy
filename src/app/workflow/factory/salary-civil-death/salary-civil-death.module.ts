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
                    import('./salary-civil-death-start/salary-civil-death-start.module').then(
                        m => m.SalaryCivilDeathStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-civil-death-manager/salary-civil-death-manager.module').then(
                        m => m.SalaryCivilDeathManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-civil-death-manager/salary-civil-death-manager.module').then(
                        m => m.SalaryCivilDeathManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilDeathModule {}
