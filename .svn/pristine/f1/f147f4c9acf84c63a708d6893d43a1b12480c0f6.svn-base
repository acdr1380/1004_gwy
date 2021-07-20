import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AgentManageComponent } from '../agent-manage/agent-manage.component';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
const routes: Routes = [
    {
        path: '',
        component: AgentManageComponent,
    },
];

@NgModule({
    declarations: [AgentManageComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        NzButtonModule,
        NzCardModule,
        NzDrawerModule,
        FormsModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzIconModule,

        DictionaryInputModule,
    ],
    providers: [NzModalService],
})
export class AgentManageModule { }
