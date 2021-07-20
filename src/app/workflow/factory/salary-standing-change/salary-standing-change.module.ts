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
                    import('./standing-change-start/standing-change-start.module').then(
                        m => m.StandingChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./standing-change-manager/standing-change-manager.module').then(
                        m => m.StandingChangeManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./standing-change-manager/standing-change-manager.module').then(
                        m => m.StandingChangeManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],

})
export class SalaryStandingChangeModule { }
