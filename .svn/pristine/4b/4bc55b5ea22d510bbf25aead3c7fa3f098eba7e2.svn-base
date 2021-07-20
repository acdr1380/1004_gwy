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
import { SalaryCivilInitializePersonTableComponent } from '../salary-civil-initialize-person-table/salary-civil-initialize-person-table.component';
import { SalaryCivilInitializeListFormModule } from '../salary-civil-initialize-list-form/salary-civil-initialize-list-form.module';
import { SalaryCivilInitializeManagerComponent } from './salary-civil-initialize-manager.component';

const routes: Routes = [
    {
        path: '',
        component: SalaryCivilInitializeManagerComponent,
    },
];

@NgModule({
    declarations: [SalaryCivilInitializeManagerComponent],
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
        SalaryCivilInitializeListFormModule,
        OnlineDocModule,
        LoadingModule,
    ],
    providers: [NzModalService, SalaryCivilInitializePersonTableComponent],
})
export class SalaryCivilInitializeManagerModule { }
