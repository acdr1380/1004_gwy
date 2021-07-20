import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'job-management', pathMatch: 'full' },
            {
                path: 'job-management',
                loadChildren: () =>
                    import('./job-management/job-management.module').then(
                        m => m.JobManagementModule
                    ),
            },
            {
                path: 'promotion-query',
                loadChildren: () =>
                    import('./promotion-query/promotion-query.module').then(
                        m => m.PromotionQueryModule
                    ),
            },
            {
                path: 'promotion-calculate',
                loadChildren: () =>
                    import('./promotion-calculate/promotion-calculate.module').then(
                        m => m.PromotionCalculateModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [],
})
export class RankManagementModule {}
