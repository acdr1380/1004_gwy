import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryGZDA07JBTComponent } from './salary-gzda07-jbt.component';
import { SalaryGzda07JbtDrawerComponent } from './salary-gzda07-jbt-drawer/salary-gzda07-jbt-drawer.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';

@NgModule({
    declarations: [SalaryGZDA07JBTComponent, SalaryGzda07JbtDrawerComponent],
    imports: [CommonModule, NzTableModule, NzDrawerModule],
    exports: [SalaryGZDA07JBTComponent, SalaryGzda07JbtDrawerComponent],
})
export class SalaryGZDA07JBTModule {}
