import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TibetPersonEnterStartComponent } from './tibet-person-enter-start.component';
import { RouterModule, Routes } from '@angular/router';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { TibetPersonEnterTableModule } from '../tibet-person-enter-table/tibet-person-enter-table.module';
import { TibetPersonEnterListModule } from '../tibet-person-enter-list/tibet-person-enter-list.module';
import { TibetPersonEnterFillModule } from '../tibet-person-enter-fill/tibet-person-enter-fill.module';

const routes: Routes = [{ path: '', component: TibetPersonEnterStartComponent }];
@NgModule({
    declarations: [TibetPersonEnterStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
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
        TibetPersonEnterTableModule,
        TibetPersonEnterListModule,
        TibetPersonEnterFillModule,
    ],
})
export class TibetPersonEnterStartModule {}
