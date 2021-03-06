import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaryDistributeComponent } from './salary-distribute.component';
import { RouterModule, Routes } from '@angular/router';
import { DistributeSelectPersonModule } from './distribute-select-person/distribute-select-person.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectUnitLevelModule } from '../../components/select-unit-level/select-unit-level.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { DistributeDetailComponent } from './distribute-detail/distribute-detail.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { MonthStateInfoComponent } from './month-state-info/month-state-info.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
const routes: Routes = [
    { path: '', component: SalaryDistributeComponent },
    { path: 'distribute-detail', component: DistributeDetailComponent },
];

@NgModule({
    declarations: [SalaryDistributeComponent, DistributeDetailComponent, MonthStateInfoComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        SelectUnitLevelModule,
        DistributeSelectPersonModule,
        ScrollingModule,
        NzSelectModule,
        NzCheckboxModule,
        NzTreeModule,
        NzGridModule,
        NzDropDownModule,
        NzButtonModule,
        NzIconModule,
        NzTableModule,
        NzDrawerModule,
        NzInputModule,
        NzEmptyModule,
        NzPopconfirmModule,
        NzPopoverModule,
    ],
})
export class SalaryDistributeModule {}
