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
                        './salary-education-change-start/salary-education-change-start.module'
                    ).then(m => m.SalaryEducationChangeStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-education-change-manager/salary-education-change-manager.module'
                    ).then(m => m.SalaryEducationChangeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-education-change-manager/salary-education-change-manager.module'
                    ).then(m => m.SalaryEducationChangeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryEducationChangeModule {}
