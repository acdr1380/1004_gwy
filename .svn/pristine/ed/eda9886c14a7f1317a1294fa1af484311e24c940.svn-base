import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { SalaryHighLowManagerComponent } from './salary-high-low-manager.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { SalaryHighLowListModule } from '../salary-high-low-list/salary-high-low-list.module';

const route: Routes = [{ path: '', component: SalaryHighLowManagerComponent }];

@NgModule({
    declarations: [SalaryHighLowManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        LoadingModule,

        NzButtonModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzSelectModule,
        NzModalModule,
        NzGridModule,
        SalaryHighLowListModule,
    ],
})
export class SalaryHighLowManagerModule {}
