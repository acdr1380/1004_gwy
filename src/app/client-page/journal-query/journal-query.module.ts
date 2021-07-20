import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalQueryComponent } from './journal-query.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { Routes, RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { OperListComponent } from './oper-list/oper-list.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', component: JournalQueryComponent },
            {
                path: 'oper-list',
                component: OperListComponent,
            },
        ],
    },
];

@NgModule({
    declarations: [JournalQueryComponent, OperListComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzDropDownModule,
        FormsModule,
        ScrollingModule,
        NzDatePickerModule,
        NzRadioModule,
        NzEmptyModule,
        NzTreeModule,
        NzButtonModule,
        NzSelectModule,
        NzTableModule,
        NzTabsModule,
    ],
})
export class JournalQueryModule {}
