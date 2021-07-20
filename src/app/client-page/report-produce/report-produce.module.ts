import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportProduceComponent } from './report-produce.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

const router: Routes = [
    {
        path: '',
        component: ReportProduceComponent,
    },
];

@NgModule({
    declarations: [ReportProduceComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(router),
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,

        NzTableModule,
        NzDrawerModule,
        NzTabsModule,
        NzSelectModule,
        NzFormModule,
        NzTimelineModule,
        NzButtonModule,
        NzModalModule,
    ],
})
export class ReportProduceModule {}
