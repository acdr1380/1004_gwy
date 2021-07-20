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
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AllowanceChangeManagerComponent } from './allowance-change-manager.component';
import { AllowanceChangeFormModule } from '../allowance-change-form/allowance-change-form.module';

const route: Routes = [{ path: '', component: AllowanceChangeManagerComponent }];

@NgModule({
    declarations: [AllowanceChangeManagerComponent],
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

        AllowanceChangeFormModule,
    ],
})
export class AllowanceChangeManagerModule { }
