import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { SalaryCivilDeathListModule } from '../salary-civil-death-list/salary-civil-death-list.module';
import { SalaryCivilDeathManagerComponent } from './salary-civil-death-manager.component';

const route: Routes = [{ path: '', component: SalaryCivilDeathManagerComponent }];

@NgModule({
    declarations: [SalaryCivilDeathManagerComponent],
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
        SalaryCivilDeathListModule,
    ],
})
export class SalaryCivilDeathManagerModule {}
