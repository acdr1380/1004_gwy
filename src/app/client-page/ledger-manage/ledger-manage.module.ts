
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LedgerManageComponent } from './ledger-manage.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { LedgerContentModule } from './ledger-content/ledger-content.module';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';

const routes: Routes = [
    { path: '', component: LedgerManageComponent },
];

@NgModule({
    declarations: [LedgerManageComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        RouterModule.forChild(routes),
        NzSelectModule,
        NzTreeModule,
        NzDrawerModule,
        NzButtonModule,
        NzCheckboxModule,
        NzFormModule,

        DictionaryInputModule,
        LedgerContentModule,
    ],
    providers: [NzModalService]
})
export class LedgerManageModule { }
