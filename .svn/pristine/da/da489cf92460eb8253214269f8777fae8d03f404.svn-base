import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryCivilLevelRiseStartComponent } from './salary-civil-level-rise-start.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CivilLevelPersonTableModule } from '../civil-level-person-table/civil-level-person-table.module';
import { OperSelectPersonModule } from 'app/components/oper-select-person/oper-select-person.module';
import { OperSelectContactsModule } from 'app/components/oper-select-contacts/oper-select-contacts.module';
import { CivilLevelRiseListModule } from '../civil-level-rise-list/civil-level-rise-list.module';
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


const routes: Routes = [
    {
        path: '',
        component: SalaryCivilLevelRiseStartComponent,
    },
];

@NgModule({
    declarations: [SalaryCivilLevelRiseStartComponent],
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

        CivilLevelPersonTableModule,
        OperSelectContactsModule,
        CivilLevelRiseListModule,
        LoadingModule,
        OnlineDocModule,
    ],
    providers: [NzModalService]
})
export class SalaryCivilLevelRiseStartModule { }
