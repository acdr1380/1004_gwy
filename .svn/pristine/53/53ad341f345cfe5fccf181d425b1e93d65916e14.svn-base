import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TwoYearRiseComponent } from './two-year-rise.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeployComponent } from './deploy/deploy.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

// 机关工勤两年晋档业务;

const routes: Routes = [
    {
        path: '',
        component: TwoYearRiseComponent,
    },
    {
        path: 'deploy',
        component: DeployComponent,
    },
];

@NgModule({
    declarations: [TwoYearRiseComponent, DeployComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzSelectModule,
        NzTableModule,
        NzDrawerModule,
        NzTabsModule,
        NzTimelineModule,
        NzFormModule,
        NzDatePickerModule,
        NzButtonModule,
        NzInputModule,
        NzIconModule,

        SelectUnitLevelModule,
    ],
})
export class TwoYearRiseModule { }
