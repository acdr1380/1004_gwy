import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'starting-plan',
                loadChildren: () =>
                    import('./starting-plan/starting-plan.module').then(m => m.StartingPlanModule),
            },
            {
                path: 'subst-person',
                loadChildren: () =>
                    import('./subst-person/subst-person.module').then(m => m.SubstPersonModule),
            },
        ],
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class StartingManageModule {}
