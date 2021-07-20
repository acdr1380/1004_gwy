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
                        './civil-education-change-start/civil-education-change-start.module'
                    ).then(m => m.CivilEducationChangeStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './civil-education-change-manager/civil-education-change-manager.module'
                    ).then(m => m.CivilEducationChangeManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './civil-education-change-manager/civil-education-change-manager.module'
                    ).then(m => m.CivilEducationChangeManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilEducationChangeModule {}
