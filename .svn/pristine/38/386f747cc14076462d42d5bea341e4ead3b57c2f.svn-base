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
import { SalaryCivilInitializeAllowanceTableComponent } from './salary-civil-initialize-allowance-table.component';
import { SalaryCivilInitializeAllowEditComponent } from '../salary-civil-initialize-allow-edit/salary-civil-initialize-allow-edit.component';

@NgModule({
    declarations: [SalaryCivilInitializeAllowanceTableComponent, SalaryCivilInitializeAllowEditComponent],
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
    exports: [SalaryCivilInitializeAllowanceTableComponent],
})
export class SalaryCivilInitializeAllowanceTableModule { }
