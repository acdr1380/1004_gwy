import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { TibetPlanApplyExcelComponent } from './tibet-plan-apply-excel.component';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@NgModule({
    declarations: [TibetPlanApplyExcelComponent],
    imports: [
        CommonModule,
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        LoadingModule,
        ExcelControlModule,

        NzFormModule,
        NzDrawerModule,
        NzButtonModule,
        NzInputModule,
        NzSelectModule,
        NzInputNumberModule,
        NzIconModule,
        NzCheckboxModule,
        NzTabsModule,
    ],
    exports: [TibetPlanApplyExcelComponent],
})
export class TibetPlanApplyExcelModule {}
