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
                    import('./salary-retire-start/salary-retire-start.module').then(
                        m => m.SalaryRetireStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-retire-manager/salary-retire-manager.module').then(
                        m => m.SalaryRetireManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-retire-manager/salary-retire-manager.module').then(
                        m => m.SalaryRetireManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryRetireModule {}
