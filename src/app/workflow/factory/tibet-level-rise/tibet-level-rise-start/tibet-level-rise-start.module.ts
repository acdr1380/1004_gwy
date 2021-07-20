import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TibetLevelRiseStartComponent } from './tibet-level-rise-start.component';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LevelRiseTableModule } from '../level-rise-table/level-rise-table.module';
import { LevelRiseListModule } from '../level-rise-list/level-rise-list.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';

const route: Routes = [{ path: '', component: TibetLevelRiseStartComponent }];

@NgModule({
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
        LevelRiseTableModule,
        LevelRiseListModule,
        NzSpinModule,
    ],
    declarations: [TibetLevelRiseStartComponent],
})
export class TibetLevelRiseStartModule {}
