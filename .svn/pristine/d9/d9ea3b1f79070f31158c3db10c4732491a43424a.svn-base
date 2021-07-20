import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SalaryInitializeAllowanceTableComponent } from './salary-initialize-allowance-table.component';
import { SalaryInitializeAllowEditComponent } from '../salary-initialize-allow-edit/salary-initialize-allow-edit.component';

@NgModule({
    declarations: [SalaryInitializeAllowanceTableComponent, SalaryInitializeAllowEditComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        NzDrawerModule,
        NzTableModule,
        NzButtonModule,

        OperSelectPersonModule,
        DictionaryInputModule,
        DatetimeInputModule,
    ],
    exports: [SalaryInitializeAllowanceTableComponent],
})
export class SalaryInitializeAllowanceTableModule { }
