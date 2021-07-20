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
                    import('./tibet-level-rise-start/tibet-level-rise-start.module').then(
                        m => m.TibetLevelRiseStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./tibet-level-rise-manager/tibet-level-rise-manager.module').then(
                        m => m.TibetLevelRiseManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./tibet-level-rise-manager/tibet-level-rise-manager.module').then(
                        m => m.TibetLevelRiseManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetLevelRiseModule {}
