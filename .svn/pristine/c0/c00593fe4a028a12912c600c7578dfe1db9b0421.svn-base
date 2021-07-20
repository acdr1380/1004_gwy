import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevelRiseComponent } from './level-rise.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeployComponent } from './deploy/deploy.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
// 薪级晋升业务;

const routes: Routes = [
    {
        path: '',
        component: LevelRiseComponent,
    },
    {
        path: 'deploy',
        component: DeployComponent,
    },
];

@NgModule({
    declarations: [LevelRiseComponent, DeployComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzButtonModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        SelectUnitLevelModule,
        NzSelectModule,
        NzTableModule,
        NzTabsModule,
        NzDrawerModule,
        NzTimelineModule,
        NzFormModule,
        NzDatePickerModule,
        NzInputModule,
    ],
})
export class LevelRiseModule {}
