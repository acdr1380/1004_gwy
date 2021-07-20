import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SalaryInitializePersonTableComponent } from '../salary-initialize-person-table/salary-initialize-person-table.component';
import { SalaryInitializeListFormModule } from '../salary-initialize-list-form/salary-initialize-list-form.module';
import { SalaryInitializeManagerComponent } from './salary-initialize-manager.component';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

const routes: Routes = [
    {
        path: '',
        component: SalaryInitializeManagerComponent,
    },
];

@NgModule({
    declarations: [SalaryInitializeManagerComponent],
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
        NzStepsModule,
        NzTimelineModule,

        OperSelectContactsModule,
        SalaryInitializeListFormModule,
        OnlineDocModule,
        LoadingModule,
    ],
    providers: [NzModalService, SalaryInitializePersonTableComponent],
})
export class SalaryInitializeManagerModule { }
