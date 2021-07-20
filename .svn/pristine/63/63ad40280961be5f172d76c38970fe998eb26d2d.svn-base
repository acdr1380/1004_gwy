import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { LoadingModule } from 'app/components/loading/loading.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TibetAnnualAssessStartComponent } from './tibet-annual-assess-start.component';
import { TibetAnnualAssessTableModule } from '../tibet-annual-assess-table/tibet-annual-assess-table.module';
import { TibetAnnualAssessListModule } from '../tibet-annual-assess-list/tibet-annual-assess-list.module';

const routes: Routes = [
    {
        path: '',
        component: TibetAnnualAssessStartComponent,
    },
];

@NgModule({
    declarations: [TibetAnnualAssessStartComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        RouterModule.forChild(routes),
        NzStepsModule,
        NzButtonModule,
        NzDrawerModule,
        NzTimelineModule,
        NzFormModule,
        NzUploadModule,
        NzInputModule,

        TibetAnnualAssessTableModule,
        OperSelectContactsModule,
        TibetAnnualAssessListModule,
        LoadingModule,
        OnlineDocModule,
    ],
    providers: [NzModalService]
})
export class TibetAnnualAssessStartModule { }
