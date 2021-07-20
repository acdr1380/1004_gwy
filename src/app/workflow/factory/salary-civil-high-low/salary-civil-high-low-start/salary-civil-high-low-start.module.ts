import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCivilHighLowStartComponent } from './salary-civil-high-low-start.component';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilHighLowTableModule } from '../civil-high-low-table/civil-high-low-table.module';
import { CivilHighLowListModule } from '../civil-high-low-list/civil-high-low-list.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzUploadModule } from 'ng-zorro-antd/upload';

const route: Routes = [{ path: '', component: SalaryCivilHighLowStartComponent }];

@NgModule({
    declarations: [SalaryCivilHighLowStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzStepsModule,
        NzFormModule,
        NzUploadModule,
        NzDrawerModule,
        NzButtonModule,
        NzModalModule,
        NzGridModule,
        NzInputModule,

        CivilHighLowTableModule,
        CivilHighLowListModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,
    ],
})
export class SalaryCivilHighLowStartModule { }
