import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { UnitMainViewComponent } from './unit-main-view/unit-main-view.component';
import { LoadingModule } from 'app/components/loading/loading.module';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';

import { UnitMsgViewComponent } from './unit-msg-view/unit-msg-view.component';
import { UnitRecoverViewComponent } from './unit-recover-view/unit-recover-view.component';
import { UnitTransferViewComponent } from './unit-transfer-view/unit-transfer-view.component';
import { UnitSortViewComponent } from './unit-sort-view/unit-sort-view.component';
import { UnitBatchTransferViewComponent } from './unit-batch-transfer-view/unit-batch-transfer-view.component';
import { UnitCheckViewComponent } from './unit-check-view/unit-check-view.component';
import { UnitExcelViewComponent } from './unit-excel-view/unit-excel-view.component';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

const routes: Routes = [
    {
        path: '', component: UnitMainViewComponent, data: { tag: 'unit-manage' }
    },
];

@NgModule({
    declarations: [
        UnitMainViewComponent,
        UnitMsgViewComponent,
        UnitRecoverViewComponent,
        UnitTransferViewComponent,
        UnitSortViewComponent,
        UnitBatchTransferViewComponent,
        UnitCheckViewComponent,
        UnitExcelViewComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
 
        DictionaryInputModule,
        LoadingModule,
        DictionaryInputModule,
        ExcelControlModule,

        NzTreeModule,
        NzRadioModule,
        NzSelectModule,
        NzDrawerModule,
        NzTabsModule,
        NzButtonModule,
        NzTableModule,
        NzCardModule,
        NzSpinModule,
        NzModalModule,
        NzFormModule,
        NzDatePickerModule,
        NzInputModule,
        NzInputNumberModule,
        NzNoAnimationModule,
        NzCheckboxModule,
        NzResultModule,
        NzUploadModule,
        NzIconModule,
        NzDividerModule,
        NzTagModule,
    ],
    providers: []
})
export class UnitManageModule { }
