import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TibetPersonQuitFormComponent } from './tibet-person-quit-form.component';


@NgModule({
    declarations: [TibetPersonQuitFormComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        ExcelControlModule,
        OnlineDocModule,
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
        NzInputModule,
    ],
    exports: [TibetPersonQuitFormComponent],
})
export class TibetPersonQuitFormModule { }
