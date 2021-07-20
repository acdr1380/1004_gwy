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
                    import('./salary-sick-leave-start/salary-sick-leave-start.module').then(
                        m => m.SalarySickLeaveStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./salary-sick-leave-manager/salary-sick-leave-manager.module').then(
                        m => m.SalarySickLeaveManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./salary-sick-leave-manager/salary-sick-leave-manager.module').then(
                        m => m.SalarySickLeaveManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalarySickLeaveModule {}
