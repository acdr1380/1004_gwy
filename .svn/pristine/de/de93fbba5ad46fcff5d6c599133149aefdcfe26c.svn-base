import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperSalaryInfoPageComponent } from '../oper-salary-info-page/oper-salary-info-page.component';
import { OperSalaryInfoModule } from 'app/components/oper-salary-info/oper-salary-info.module';

const routes: Routes = [
    {
        path: '',
        component: OperSalaryInfoPageComponent,
    },
];

@NgModule({
    declarations: [OperSalaryInfoPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes), OperSalaryInfoModule],
})
export class OperSalaryInfoPageModule {}
