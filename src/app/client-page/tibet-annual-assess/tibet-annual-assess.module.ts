import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';
import { DeployComponent } from './deploy/deploy.component';
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
import { TibetAnnualAssessComponent } from './tibet-annual-assess.component';

// 年度考核
const routes: Routes = [
    {
        path: '',
        component: TibetAnnualAssessComponent,
    },
    {
        path: 'deploy',
        component: DeployComponent,
    },
];

@NgModule({
    declarations: [TibetAnnualAssessComponent, DeployComponent],
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
export class TibetAnnualAssessModule { }
