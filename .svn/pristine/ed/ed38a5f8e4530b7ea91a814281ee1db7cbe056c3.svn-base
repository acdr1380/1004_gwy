import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';

import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { SalaryCivilInitializeListFormModule } from '../salary-civil-initialize-list-form/salary-civil-initialize-list-form.module';
import { SalaryCivilInitializePersonTableModule } from '../salary-civil-initialize-person-table/salary-civil-initialize-person-table.module';
import { SalaryCivilInitializeStartComponent } from './salary-civil-initialize-start.component';

const routes: Routes = [
    {
        path: '',
        component: SalaryCivilInitializeStartComponent,
    },
];

@NgModule({
    declarations: [SalaryCivilInitializeStartComponent],
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
        SalaryCivilInitializePersonTableModule,
        SalaryCivilInitializeListFormModule,
    ],
    providers: [NzModalService],
})
export class SalaryCivilInitializeStartModule { }
