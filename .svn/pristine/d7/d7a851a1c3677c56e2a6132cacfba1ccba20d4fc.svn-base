import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilPunishmentReduceStartComponent } from './civil-punishment-reduce-start.component';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilPunishmentReduceTableModule } from '../civil-punishment-reduce-table/civil-punishment-reduce-table.module';
import { CivilPunishmentReduceListModule } from '../civil-punishment-reduce-list/civil-punishment-reduce-list.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';

const route: Routes = [{ path: '', component: CivilPunishmentReduceStartComponent }];

@NgModule({
    declarations: [CivilPunishmentReduceStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        CivilPunishmentReduceTableModule,
        CivilPunishmentReduceListModule,
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
export class CivilPunishmentReduceStartModule {}
