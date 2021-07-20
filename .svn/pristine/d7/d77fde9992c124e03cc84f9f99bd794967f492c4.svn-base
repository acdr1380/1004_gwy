import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const router: Routes = [
    {
        path: '',
        children: [
            {
                path: 'query',
                loadChildren: () =>
                    import('./policy-query/policy-query.module').then(m => m.PolicyQueryModule),
            },
            {
                path: 'maintain',
                loadChildren: () =>
                    import('./maintain/maintain.module').then(m => m.MaintainModule),
            },
            {
                path: 'set-classification',
                loadChildren: () =>
                    import('./set-classification/set-classification.module').then(
                        m => m.SetClassificationModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(router)],
})
export class PolicyModule {}
