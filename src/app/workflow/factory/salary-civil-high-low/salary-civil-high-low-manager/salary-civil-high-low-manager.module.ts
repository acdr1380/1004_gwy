import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCivilHighLowManagerComponent } from './salary-civil-high-low-manager.component';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilHighLowListModule } from '../civil-high-low-list/civil-high-low-list.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzInputModule } from 'ng-zorro-antd/input';

const route: Routes = [{ path: '', component: SalaryCivilHighLowManagerComponent }];

@NgModule({
    declarations: [SalaryCivilHighLowManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzButtonModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzSelectModule,
        NzModalModule,
        NzGridModule,
        NzInputModule,

        CivilHighLowListModule,
        LoadingModule,
    ],
})
export class SalaryCivilHighLowManagerModule { }
