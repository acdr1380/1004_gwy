import { NzTableModule } from 'ng-zorro-antd/table';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportVerifyComponent } from './report-verify.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [{ path: '', component: ReportVerifyComponent }];

@NgModule({
    declarations: [ReportVerifyComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        NzTableModule,
    ],
})
export class ReportVerifyModule {}
