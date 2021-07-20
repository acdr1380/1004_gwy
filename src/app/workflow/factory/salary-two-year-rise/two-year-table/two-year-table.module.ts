import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TwoYearTableComponent } from './two-year-table.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { SalaryGZ07Module } from 'app/components/salary-gz07/salary-gz07.module';
@NgModule({
    declarations: [TwoYearTableComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        NzSelectModule,
        NzTableModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzUploadModule,
        NzFormModule,
        NzInputNumberModule,
        NzButtonModule,
        NzIconModule,
        NzToolTipModule,
        NzInputModule,
        NzDividerModule,
        NzTabsModule,
        NzRadioModule,

        OnlineDocModule,
        OperSelectPersonModule,
        DictionaryInputModule,
        SalaryGZ07Module,
    ],
    providers: [DatePipe],
    exports: [TwoYearTableComponent],
})
export class TwoYearTableModule { }
