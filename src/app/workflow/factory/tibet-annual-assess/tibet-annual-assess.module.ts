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
                loadChildren: () => import('./tibet-annual-assess-start/tibet-annual-assess-start.module')
                    .then(m => m.TibetAnnualAssessStartModule)
            },
            {
                path: 'manager',
                loadChildren: () => import('./tibet-annual-assess-manager/tibet-annual-assess-manager.module').then(
                    m => m.TibetAnnualAssessManagerModule
                )
            },
            {
                path: 'leader',
                loadChildren: () => import('./tibet-annual-assess-manager/tibet-annual-assess-manager.module').then(
                    m => m.TibetAnnualAssessManagerModule
                )
            },
        ],
    }
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],

})
export class TibetAnnualAssessModule { }
