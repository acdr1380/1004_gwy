import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilStandingChangeStartComponent } from './civil-standing-change-start.component';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { StandingPersonTableModule } from '../civil-standing-table/civil-standing-table.module';
import { CivilStandingListModule } from '../civil-standing-list/civil-standing-list.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';

const routes: Routes = [
    {
        path: '',
        component: CivilStandingChangeStartComponent,
    },
];
@NgModule({
    declarations: [CivilStandingChangeStartComponent],
    imports: [
        CommonModule,
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        ScrollingModule,
        NzInputModule,
        NzFormModule,
        NzStepsModule,
        NzUploadModule,
        NzDrawerModule,
        NzButtonModule,

        OperSelectPersonModule,
        StandingPersonTableModule,
        CivilStandingListModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,
    ],
    providers: [NzModalService],
})
export class CivilStandingChangeStartModule { }
