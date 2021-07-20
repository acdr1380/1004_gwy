import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCivliInnerTransferManagerComponent } from './salary-civli-inner-transfer-manager.component';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { InnerTransferListFormModule } from '../inner-transfer-list-form/inner-transfer-list-form.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InnerTransferPersonTableComponent } from '../inner-transfer-person-table/inner-transfer-person-table.component';

const routes: Routes = [
    {
        path: '',
        component: SalaryCivliInnerTransferManagerComponent,
    },
];

@NgModule({
    declarations: [SalaryCivliInnerTransferManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzDrawerModule,
        NzSelectModule,
        NzButtonModule,
        NzInputModule,

        OperSelectContactsModule,
        InnerTransferListFormModule,
        OnlineDocModule,
        LoadingModule,
    ],
    providers: [NzModalService, InnerTransferPersonTableComponent],
})
export class SalaryCivliInnerTransferManagerModule { }
