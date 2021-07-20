import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCivliInnerTransferStartComponent } from './salary-civli-inner-transfer-start.component';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { InnerTransferPersonTableModule } from '../inner-transfer-person-table/inner-transfer-person-table.module';

import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InnerTransferListFormModule } from '../inner-transfer-list-form/inner-transfer-list-form.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';

const routes: Routes = [
    {
        path: '',
        component: SalaryCivliInnerTransferStartComponent,
    },
];

@NgModule({
    declarations: [SalaryCivliInnerTransferStartComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        ScrollingModule,
        NzIconModule,
        NzToolTipModule,
        NzInputModule,
        NzFormModule,
        NzStepsModule,
        NzUploadModule,
        NzDrawerModule,
        NzButtonModule,

        OnlineDocModule,
        LoadingModule,
        OperSelectContactsModule,
        OperSelectPersonModule,
        InnerTransferPersonTableModule,
        InnerTransferListFormModule,
    ],
    providers: [NzModalService],
})
export class SalaryCivliInnerTransferStartModule { }
