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
                    import('./tibet-exam-record-start/tibet-exam-record-start.module').then(
                        m => m.TibetExamRecordStartModule
                    ),
            },
            {
                path: 'manager',
                loadChildren: () =>
                    import('./tibet-exam-record-manager/tibet-exam-record-manager.module').then(
                        m => m.TibetExamRecordManagerModule
                    ),
            },
            {
                path: 'leader',
                loadChildren: () =>
                    import('./tibet-exam-record-manager/tibet-exam-record-manager.module').then(
                        m => m.TibetExamRecordManagerModule
                    ),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TibetExamRecordModule {}
