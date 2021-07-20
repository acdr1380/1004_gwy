import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCalculateComponent } from './salary-calculate.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';

import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';

const route: Routes = [{ path: '', component: SalaryCalculateComponent }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        FormsModule,
        ReactiveFormsModule,
        DictionaryInputModule,

        NzTabsModule,
        NzButtonModule,
        NzDividerModule,
        NzDatePickerModule,
        NzTableModule,
        NzInputModule,
        NzFormModule,
        NzGridModule,
        NzDrawerModule,
        NzIconModule,
        NzModalModule,
        NzSelectModule,
        NzCheckboxModule,
        NzCardModule,
        NzTagModule,
        NzSpinModule,
        NzInputNumberModule,
        DatetimeInputModule,
    ],
    declarations: [SalaryCalculateComponent],
})
export class SalaryCalculateModule {}
