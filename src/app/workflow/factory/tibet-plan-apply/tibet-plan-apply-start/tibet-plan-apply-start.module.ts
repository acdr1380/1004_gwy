import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TibetPlanApplyStartComponent } from './tibet-plan-apply-start.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { TibetPlanApplyExcelModule } from '../tibet-plan-apply-excel/tibet-plan-apply-excel.module';
import { TibetPlanApplyFormModule } from '../tibet-plan-apply-form/tibet-plan-apply-form.module';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const routes: Routes = [{ path: '', component: TibetPlanApplyStartComponent }];

@NgModule({
    declarations: [TibetPlanApplyStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,
        TibetPlanApplyExcelModule,
        TibetPlanApplyFormModule,

        NzStepsModule,
        NzFormModule,
        NzUploadModule,
        NzDrawerModule,
        NzButtonModule,
        NzModalModule,
        NzGridModule,
        NzInputModule,
        NzDatePickerModule,
        NzSelectModule,
        NzTimelineModule,
        NzRadioModule,
    ],
})
export class TibetPlanApplyStartModule { }
