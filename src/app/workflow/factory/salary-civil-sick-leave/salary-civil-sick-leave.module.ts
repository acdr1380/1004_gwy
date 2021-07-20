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
                    import(
                        './salary-civil-sick-leave-start/salary-civil-sick-leave-start.module'
                    ).then(m => m.SalaryCivilSickLeaveStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-sick-leave-manager/salary-civil-sick-leave-manager.module'
                    ).then(m => m.SalaryCivilSickLeaveManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-sick-leave-manager/salary-civil-sick-leave-manager.module'
                    ).then(m => m.SalaryCivilSickLeaveManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilSickLeaveModule {}
