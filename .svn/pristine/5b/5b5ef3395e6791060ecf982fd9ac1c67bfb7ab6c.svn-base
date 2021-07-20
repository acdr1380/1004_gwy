import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListsQueryComponent } from './lists-query.component';
import { Routes, RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

const router: Routes = [
    {
        path: '',
        component: ListsQueryComponent,
    },
];

@NgModule({
    declarations: [ListsQueryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(router),
        ScrollingModule,
        FormsModule,
        NzTabsModule,
        NzCardModule,
        NzButtonModule,
        NzTagModule,

        SelectUnitLevelModule,
        ExcelControlModule,
    ],
})
export class ListsQueryModule { }
