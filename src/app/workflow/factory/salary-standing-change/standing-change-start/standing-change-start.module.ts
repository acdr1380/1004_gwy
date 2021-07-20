import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandingChangeStartComponent } from './standing-change-start.component';
import { RouterModule, Routes } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingModule } from 'app/components/loading/loading.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { StandingChangeListModule } from '../standing-change-list/standing-change-list.module';
import { StandingChangeTableModule } from '../standing-change-table/standing-change-table.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

const route: Routes = [{ path: '', component: StandingChangeStartComponent }];

@NgModule({
    declarations: [StandingChangeStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        StandingChangeListModule,
        StandingChangeTableModule,
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
    ],
})
export class StandingChangeStartModule { }
