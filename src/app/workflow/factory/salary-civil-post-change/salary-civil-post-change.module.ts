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
                    import('./civil-post-change-start/civil-post-change-start.module').then(
                        m => m.CivilPostChangeStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./civil-post-change-manager/civil-post-change-manager.module').then(
                        m => m.CivilPostChangeManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./civil-post-change-manager/civil-post-change-manager.module').then(
                        m => m.CivilPostChangeManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilPostChangeModule {}
