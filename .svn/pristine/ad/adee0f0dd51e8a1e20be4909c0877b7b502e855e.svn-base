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
                loadChildren: () => import('./tibet-person-edit-start/tibet-person-edit-start.module')
                    .then(m => m.TibetPersonEditStartModule)
            },
            {
                path: 'manager',
                loadChildren: () => import('./tibet-person-edit-manager/tibet-person-edit-manager.module')
                    .then(m => m.TibetPersonEditManagerModule)
            },
            {
                path: 'leader',
                loadChildren: () => import('./tibet-person-edit-manager/tibet-person-edit-manager.module')
                    .then(m => m.TibetPersonEditManagerModule)
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class TibetPersonEditModule { }
