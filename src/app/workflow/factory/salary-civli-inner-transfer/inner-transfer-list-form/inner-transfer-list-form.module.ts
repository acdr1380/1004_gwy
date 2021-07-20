import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerTransferListFormComponent } from './inner-transfer-list-form.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { CivilInnerTransferDrawerModule } from '../civil-inner-transfer-drawer/civil-inner-transfer-drawer.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';


@NgModule({
    declarations: [InnerTransferListFormComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        NzToolTipModule,
        NzTabsModule,
        NzIconModule,
        NzSelectModule,
        NzPaginationModule,
        NzDrawerModule,
        NzFormModule,
        NzUploadModule,
        NzRadioModule,
        NzButtonModule,
        NzInputModule,

        OnlineDocModule,
        ExcelControlModule,
        CivilInnerTransferDrawerModule,
    ],
    exports: [InnerTransferListFormComponent],
    providers: [InnerTransferListFormComponent]
})
export class InnerTransferListFormModule { }
