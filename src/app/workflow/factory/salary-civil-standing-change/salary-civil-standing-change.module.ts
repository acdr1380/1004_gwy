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
                    import('./civil-standing-change-start/civil-standing-change-start.module').then(
                        m => m.CivilStandingChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './civil-standing-change-manager/civil-standing-change-manager.module'
                    ).then(m => m.CivilStandingChangeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './civil-standing-change-manager/civil-standing-change-manager.module'
                    ).then(m => m.CivilStandingChangeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilStandingChangeModule {}
