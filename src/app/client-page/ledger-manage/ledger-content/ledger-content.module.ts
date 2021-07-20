import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { LedgerContentComponent } from './ledger-content.component';
import { LedgerCheckModule } from '../ledger-check/ledger-check.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
    declarations: [LedgerContentComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzDrawerModule,
        NzButtonModule,
        NzFormModule,
        NzTabsModule,
        NzTableModule,
        NzSelectModule,
        NzTagModule,
        NzDividerModule,
        NzTreeModule,
        NzDatePickerModule,
        NzInputNumberModule,
        NzInputModule,
        
        DictionaryInputModule,
        LedgerCheckModule
    ],
    exports: [LedgerContentComponent],
})
export class LedgerContentModule { }
