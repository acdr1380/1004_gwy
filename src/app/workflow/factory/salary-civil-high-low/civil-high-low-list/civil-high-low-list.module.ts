import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilHighLowListComponent } from './civil-high-low-list.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { SalaryGZDA07JBTModule } from 'app/components/salary-gzda07-jbt/salary-gzda07-jbt.module';

@NgModule({
    declarations: [CivilHighLowListComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        NzTableModule,
        NzTabsModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzSelectModule,
        NzPaginationModule,
        NzFormModule,
        NzRadioModule,
        NzUploadModule,
        NzIconModule,
        NzToolTipModule,
        NzButtonModule,

        ExcelControlModule,
        OnlineDocModule,
        SalaryGZDA07JBTModule,
    ],
    exports: [CivilHighLowListComponent],
})
export class CivilHighLowListModule {}
