import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TibetPersonInitializeTableComponent } from './tibet-person-initialize-table.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { SalaryGZ07Module } from 'app/components/salary-gz07/salary-gz07.module';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
@NgModule({
    declarations: [TibetPersonInitializeTableComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        DictionaryInputModule,
        OnlineDocModule,
        DatetimeInputModule,
        ExcelControlModule,
        OperSelectPersonModule,

        NzSelectModule,
        NzTableModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzUploadModule,
        NzFormModule,
        NzInputNumberModule,
        NzButtonModule,
        SalaryGZ07Module,
        NzIconModule,
        NzToolTipModule,
        NzGridModule,
        NzInputModule,
        NzCheckboxModule,
        NzTabsModule,
        NzListModule,
    ],
    providers: [DatePipe],
    exports: [TibetPersonInitializeTableComponent],
})
export class TibetPersonInitializeTableModule {}
