import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SalaryInitializeDrawerComponent } from './salary-initialize-drawer.component';


@NgModule({
    declarations: [SalaryInitializeDrawerComponent],
    imports: [
        CommonModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,
        NzToolTipModule,
    ],
    exports: [SalaryInitializeDrawerComponent],
})
export class SalaryInitializeDrawerModule { }
