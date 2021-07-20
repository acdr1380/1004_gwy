import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetClassificationComponent } from './set-classification.component';
import { Routes, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

const routes: Routes = [
    {
        path: '',
        component: SetClassificationComponent,
    },
];

@NgModule({
    declarations: [SetClassificationComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NzButtonModule,
        NzSelectModule,
        NzTreeModule,
        NzFormModule,
        NzDrawerModule,
        NzInputModule,
        NzModalModule,
        NzCheckboxModule,
    ],
})
export class SetClassificationModule {}
