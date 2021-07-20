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
import { SalaryCivilInitializeStandingChangeModule } from '../salary-civil-initializel-standing-change/salary-civil-initialize-standing-change.module';
import { SalaryCivilInitializeAllowanceTableModule } from '../salary-civil-initialize-allowance-table/salary-civil-initialize-allowance-table.module';
import { SalaryCivilInitializePersonFileModule } from '../salary-civil-initialize-person-file/salary-civil-initialize-person-file.module';
import { SalaryCivilInitializeDrawerModule } from '../salary-civil-initialize-drawer/salary-civil-initialize-drawer.module';
import { SalaryCivilInitializePersonTableComponent } from './salary-civil-initialize-person-table.component';

@NgModule({
    declarations: [SalaryCivilInitializePersonTableComponent],
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
        SalaryCivilInitializeStandingChangeModule,
        SalaryCivilInitializeAllowanceTableModule,
        DatetimeInputModule,
        OnlineDocModule,
        OperSelectPersonModule,
        SalaryCivilInitializePersonFileModule,
        SalaryCivilInitializeDrawerModule,
    ],
    exports: [SalaryCivilInitializePersonTableComponent],
    providers: [SalaryCivilInitializePersonTableComponent],
})
export class SalaryCivilInitializePersonTableModule {}
