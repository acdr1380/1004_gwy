import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryTwoYearRiseStartComponent } from './salary-two-year-rise-start.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';

import { TwoYearTableModule } from '../two-year-table/two-year-table.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { TowYearFormListModule } from '../tow-year-form-list/tow-year-form-list.module';

const routes: Routes = [
    {
        path: '',
        component: SalaryTwoYearRiseStartComponent,
    },
];

@NgModule({
    declarations: [SalaryTwoYearRiseStartComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        RouterModule.forChild(routes),
        NzStepsModule,
        NzButtonModule,
        NzDrawerModule,
        NzTimelineModule,
        NzFormModule,
        NzUploadModule,
        NzInputModule,

        TwoYearTableModule,
        OperSelectContactsModule,
        TowYearFormListModule,
    ],
    providers: [NzModalService]
})
export class SalaryTwoYearRiseStartModule { }
