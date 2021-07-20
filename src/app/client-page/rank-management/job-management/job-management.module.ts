import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { JobManagementComponent } from './job-management.component';
import { JobNumberViewComponent } from './job-number-view/job-number-view.component';
import { OverallArrangementViewComponent } from './overall-arrangement-view/overall-arrangement-view.component';
import { UsageViewComponent } from './usage-view/usage-view.component';
import { StatisticalQueryViewComponent } from './statistical-query-view/statistical-query-view.component';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';

import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';

const route: Routes = [{ path: '', component: JobManagementComponent }];

@NgModule({
    declarations: [JobManagementComponent, JobNumberViewComponent, OverallArrangementViewComponent, UsageViewComponent, StatisticalQueryViewComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,

        DictionaryInputModule,
        LoadingModule,
        DatetimeInputModule,

        NzSelectModule,
        NzTreeModule,
        NzTabsModule,
        NzTableModule,
        NzButtonModule,
        NzInputModule,
        NzInputNumberModule,
        NzIconModule,
        NzDrawerModule,
        NzFormModule,
        NzRadioModule,
        NzDatePickerModule,
        NzPopconfirmModule,
        NzDividerModule,
    ],
})
export class JobManagementModule {}
