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
                    import('./salary-civil-retire-start/salary-civil-retire-start.module').then(
                        m => m.SalaryCivilRetireStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-civil-retire-manager/salary-civil-retire-manager.module').then(
                        m => m.SalaryCivilRetireManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-civil-retire-manager/salary-civil-retire-manager.module').then(
                        m => m.SalaryCivilRetireManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilRetireModule {}
