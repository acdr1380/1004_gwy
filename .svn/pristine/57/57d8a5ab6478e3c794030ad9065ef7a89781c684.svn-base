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
                        './salary-civil-other-reduce-start/salary-civil-other-reduce-start.module'
                    ).then(m => m.SalaryCivilOtherReduceStartModule),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import(
                        './salary-civil-other-reduce-manager/salary-civil-other-reduce-manager.module'
                    ).then(m => m.SalaryCivilOtherReduceManagerModule),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import(
                        './salary-civil-other-reduce-manager/salary-civil-other-reduce-manager.module'
                    ).then(m => m.SalaryCivilOtherReduceManagerModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class SalaryCivilOtherReduceModule {}
