import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferTableComponent } from './transfer-table.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzResultModule } from 'ng-zorro-antd/result';

import { StandingChangeModule } from '../standing-change/standing-change.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { SalaryInnerTransferDrawerModule } from '../salary-inner-transfer-drawer/salary-inner-transfer-drawer.module';
import { SalaryInnerTransferPersonFileModule } from '../salary-inner-transfer-person-file/salary-inner-transfer-person-file.module';
import { AllowanceTableModule } from '../allowance-table/allowance-table.module';
import { IsTeacherTableModule } from '../is-teacher-table/is-teacher-table.module';


@NgModule({
    declarations: [TransferTableComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        NzRadioModule,
        FormsModule,
        NzIconModule,
        NzToolTipModule,
        NzSelectModule,
        NzPaginationModule,
        NzResultModule,
        NzTabsModule,
        NzButtonModule,
        NzFormModule,
        NzDrawerModule,
        NzInputModule,
        NzTableModule,
        IsTeacherTableModule,

        AllowanceTableModule,
        ReactiveFormsModule,
        DictionaryInputModule,
        OnlineDocModule,
        StandingChangeModule,
        OperSelectPersonModule,
        DatetimeInputModule,
        SalaryInnerTransferDrawerModule,
        SalaryInnerTransferPersonFileModule,
    ],
    exports: [TransferTableComponent],
    providers: [TransferTableComponent],
})
export class TransferTableModule { }
