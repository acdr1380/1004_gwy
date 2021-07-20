import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SalaryInitializeStandingChangeModule } from '../salary-initializel-standing-change/salary-initialize-standing-change.module';
import { SalaryInitializeAllowanceTableModule } from '../salary-initialize-allowance-table/salary-initialize-allowance-table.module';
import { SalaryInitializePersonFileModule } from '../salary-initialize-person-file/salary-initialize-person-file.module';
import { SalaryInitializeDrawerModule } from '../salary-initialize-drawer/salary-initialize-drawer.module';
import { SalaryInitializePersonTableComponent } from './salary-initialize-person-table.component';
import { SalaryInitializeIsTeacherTableModule } from '../salary-initialize-is-teacher-table/salary-initialize-is-teacher-table.module';

@NgModule({
    declarations: [SalaryInitializePersonTableComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ScrollingModule,
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
        FormsModule,
        NzTableModule,
        NzUploadModule,

        DictionaryInputModule,
        SalaryInitializeStandingChangeModule,
        SalaryInitializeAllowanceTableModule,
        DatetimeInputModule,
        OnlineDocModule,
        OperSelectPersonModule,
        SalaryInitializePersonFileModule,
        SalaryInitializeDrawerModule,
        SalaryInitializeIsTeacherTableModule,
    ],
    exports: [SalaryInitializePersonTableComponent],
    providers: [SalaryInitializePersonTableComponent],
})
export class SalaryInitializePersonTableModule {}
