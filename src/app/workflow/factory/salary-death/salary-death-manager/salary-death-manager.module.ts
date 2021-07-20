import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryDeathManagerComponent } from './salary-death-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilPostListModule } from '../../salary-civil-post-change/civil-post-list/civil-post-list.module';
import { SalaryDeathListModule } from '../salary-death-list/salary-death-list.module';

const route: Routes = [{ path: '', component: SalaryDeathManagerComponent }];

@NgModule({
    declarations: [SalaryDeathManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        CivilPostListModule,
        LoadingModule,

        NzButtonModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzSelectModule,
        NzModalModule,
        NzGridModule,
        SalaryDeathListModule,
    ],
})
export class SalaryDeathManagerModule {}
