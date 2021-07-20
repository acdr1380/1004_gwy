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
                    import(
                        './tibet-person-initialize-start/tibet-person-initialize-start.module'
                    ).then(m => m.TibetPersonInitializeStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './tibet-person-initialize-manager/tibet-person-initialize-manager.module'
                    ).then(m => m.TibetPersonInitializeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './tibet-person-initialize-manager/tibet-person-initialize-manager.module'
                    ).then(m => m.TibetPersonInitializeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetPersonInitializeModule {}
