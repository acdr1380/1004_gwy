import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { SalaryCivilDeathStartComponent } from './salary-civil-death-start.component';
import { SalaryCivilDeathTableModule } from '../salary-civil-death-table/salary-civil-death-table.module';
import { SalaryCivilDeathListModule } from '../salary-civil-death-list/salary-civil-death-list.module';

const route: Routes = [{ path: '', component: SalaryCivilDeathStartComponent }];

@NgModule({
    declarations: [SalaryCivilDeathStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,

        NzStepsModule,
        NzFormModule,
        NzUploadModule,
        NzDrawerModule,
        NzButtonModule,
        NzModalModule,
        NzGridModule,
        NzInputModule,
        SalaryCivilDeathTableModule,
        SalaryCivilDeathListModule,
    ],
})
export class SalaryCivilDeathStartModule {}
