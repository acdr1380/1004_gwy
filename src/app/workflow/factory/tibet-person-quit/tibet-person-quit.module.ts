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
                    import('./tibet-person-quit-start/tibet-person-quit-start.module').then(
                        m => m.TibetPersonQuitStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './tibet-person-quit-manager/tibet-person-quit-manager.module'
                    ).then(m => m.TibetPersonQuitManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './tibet-person-quit-manager/tibet-person-quit-manager.module'
                    ).then(m => m.TibetPersonQuitManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],

})
export class TibetPersonQuitModule { }
