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
                    import('./tibet-person-enter-start/tibet-person-enter-start.module').then(
                        m => m.TibetPersonEnterStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./tibet-person-enter-manager/tibet-person-enter-manager.module').then(
                        m => m.TibetPersonEnterManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./tibet-person-enter-manager/tibet-person-enter-manager.module').then(
                        m => m.TibetPersonEnterManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetPersonEnterModule {}
