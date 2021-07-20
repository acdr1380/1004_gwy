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
                    import('./tibet-person-register-start/tibet-person-register-start.module').then(
                        m => m.TibetPersonRegisterStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './tibet-person-register-manager/tibet-person-register-manager.module'
                    ).then(m => m.TibetPersonRegisterManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './tibet-person-register-manager/tibet-person-register-manager.module'
                    ).then(m => m.TibetPersonRegisterManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetPersonRegisterModule {}
