import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperSelectContactsComponent } from './oper-select-contacts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
    declarations: [OperSelectContactsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzDrawerModule,
        NzSelectModule,
        NzTableModule,
        NzTreeModule,
        NzTagModule,
        NzDividerModule,
        NzButtonModule
    ],
    exports: [OperSelectContactsComponent],
})
export class OperSelectContactsModule { }
