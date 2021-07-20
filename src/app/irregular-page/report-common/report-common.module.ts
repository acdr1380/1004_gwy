import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCommonComponent } from './report-common.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const routes: Routes = [{ path: '', component: ReportCommonComponent }];

@NgModule({
    declarations: [ReportCommonComponent],
    imports: [
        CommonModule,

        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,

        RouterModule.forChild(routes),
        NzSelectModule,
        NzDrawerModule,
        NzButtonModule,
        NzSelectModule,
        NzDropDownModule,
        NzFormModule,
        NzRadioModule,
    ],
    exports: [ReportCommonComponent],
})
export class ReportCommonModule {}
