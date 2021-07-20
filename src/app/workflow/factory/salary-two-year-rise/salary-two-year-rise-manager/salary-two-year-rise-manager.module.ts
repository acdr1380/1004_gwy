import { TowYearFormListModule } from '../tow-year-form-list/tow-year-form-list.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryTwoYearRiseManagerComponent } from './salary-two-year-rise-manager.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzModalService } from 'ng-zorro-antd/modal';
const routes: Routes = [
    {
        path: '',
        component: SalaryTwoYearRiseManagerComponent,
    },
];

@NgModule({
    declarations: [SalaryTwoYearRiseManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzButtonModule,
        NzSelectModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,

        TowYearFormListModule,
        OperSelectContactsModule,
    ],
    providers: [NzModalService]
})
export class SalaryTwoYearRiseManagerModule { }
