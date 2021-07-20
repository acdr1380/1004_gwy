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
                    import('./tibet-plan-apply-start/tibet-plan-apply-start.module').then(
                        m => m.TibetPlanApplyStartModule
                    ),
            },
            {
                path: 'manager',
                redirectTo: 'start',
                pathMatch: 'full',
            },
            {
                path: 'leader',
                redirectTo: 'start',
                pathMatch: 'full',
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetPlanApplyModule {}
