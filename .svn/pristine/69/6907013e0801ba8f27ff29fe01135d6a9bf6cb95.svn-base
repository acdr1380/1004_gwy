import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilStandingChangeManagerComponent } from './civil-standing-change-manager.component';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilStandingListModule } from '../civil-standing-list/civil-standing-list.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

const routes: Routes = [
    {
        path: '',
        component: CivilStandingChangeManagerComponent,
    },
];
@NgModule({
    declarations: [CivilStandingChangeManagerComponent],
    imports: [
        CommonModule,
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        ScrollingModule,
        NzDrawerModule,
        NzSelectModule,
        NzStepsModule,
        NzTimelineModule,
        NzButtonModule,

        CivilStandingListModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,
    ],
    providers: [NzModalService],
})
export class CivilStandingChangeManagerModule { }
