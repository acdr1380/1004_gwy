import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SalarySickLeaveListModule } from '../salary-sick-leave-list/salary-sick-leave-list.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { SalarySickLeaveManagerComponent } from './salary-sick-leave-manager.component';
const route: Routes = [{ path: '', component: SalarySickLeaveManagerComponent }];

@NgModule({
    declarations: [SalarySickLeaveManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        SalarySickLeaveListModule,
        LoadingModule,

        NzButtonModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzSelectModule,
        NzModalModule,
        NzGridModule,
    ],
})
export class SalarySickLeaveManagerModule {}
