import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedQueryComponent } from './advanced-query.component';
import { AdvancdeResultComponent } from './advancde-result/advancde-result.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { DictionaryInputMultipleModule } from 'app/components/dictionary-input-multiple/dictionary-input-multiple.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
const routes: Routes = [
    { path: '', component: AdvancedQueryComponent },
    {
        path: 'advanced-query',
        component: AdvancedQueryComponent,
    },
    {
        path: 'advanced-result',
        component: AdvancdeResultComponent,
    },
];

@NgModule({
    declarations: [AdvancedQueryComponent, AdvancdeResultComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        DictionaryInputModule,
        DictionaryInputMultipleModule,
        DragDropModule,
        RouterModule.forChild(routes),
        NzTreeModule,
        NzTableModule,
        NzDatePickerModule,
        NzFormModule,
        NzCheckboxModule,
        NzSelectModule,
        NzDrawerModule,
        NzButtonModule,
        NzModalModule,
        NzInputModule,
        NzTagModule,
        NzIconModule,
    ],
})
export class AdvancedQueryModule {}
