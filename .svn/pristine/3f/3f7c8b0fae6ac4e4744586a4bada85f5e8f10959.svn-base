import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TibetPersonInitializeStartComponent } from './tibet-person-initialize-start.component';
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
import { TibetPersonInitializeListModule } from '../tibet-person-initialize-list/tibet-person-initialize-list.module';
import { TibetPersonInitializeFillModule } from '../tibet-person-initialize-fill/tibet-person-initialize-fill.module';
import { TibetPersonInitializeTableModule } from '../tibet-person-initialize-table/tibet-person-initialize-table.module';
const routes: Routes = [{ path: '', component: TibetPersonInitializeStartComponent }];
@NgModule({
    declarations: [TibetPersonInitializeStartComponent],
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
        TibetPersonInitializeListModule,
        TibetPersonInitializeFillModule,
        TibetPersonInitializeTableModule,
    ],
})
export class TibetPersonInitializeStartModule {}
