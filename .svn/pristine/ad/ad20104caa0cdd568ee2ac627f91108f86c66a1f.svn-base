import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportReverseQueryComponent } from './report-reverse-query.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [{ path: '', component: ReportReverseQueryComponent }];

@NgModule({
    declarations: [ReportReverseQueryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ScrollingModule,
        NzTreeModule,
        NzTableModule,
    ],
})
export class ReportReverseQueryModule {}
