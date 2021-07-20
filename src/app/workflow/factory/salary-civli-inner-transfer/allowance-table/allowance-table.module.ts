import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllowanceTableComponent } from './allowance-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { InnerAllowEditComponent } from '../inner-allow-edit/inner-allow-edit.component';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
    declarations: [AllowanceTableComponent, InnerAllowEditComponent],
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
    exports: [AllowanceTableComponent],
})
export class AllowanceTableModule { }
