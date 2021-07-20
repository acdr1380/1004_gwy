import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SalaryInnerTransferStartComponent } from './salary-inner-transfer-start.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TransferTableModule } from '../transfer-table/transfer-table.module';
import { TransferListModule } from '../transfer-list/transfer-list.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
const routes: Routes = [
    {
        path: '',
        component: SalaryInnerTransferStartComponent,
    },
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzStepsModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        TransferTableModule,
        TransferListModule,
        OperSelectPersonModule,
        OperSelectContactsModule,
        OnlineDocModule,
        LoadingModule,
        NzButtonModule,
        NzDrawerModule,
        NzTimelineModule,
        NzFormModule,
        NzUploadModule,

        NzTableModule,
        NzModalModule,
        NzInputModule,
    ],
    declarations: [SalaryInnerTransferStartComponent],
    providers: [DatePipe],
})
export class SalaryInnerTransferStartModule { }
