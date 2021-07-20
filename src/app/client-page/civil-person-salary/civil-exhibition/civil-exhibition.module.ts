import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilExhibitionComponent } from './civil-exhibition.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonSalaryGwyComponent } from '../person-salary-gwy/person-salary-gwy.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
const routes: Routes = [{ path: '', component: CivilExhibitionComponent }];

@NgModule({
    declarations: [CivilExhibitionComponent, PersonSalaryGwyComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzDrawerModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzSelectModule,
        NzPaginationModule,
        NzTabsModule,
        NzRadioModule,
        NzTableModule,
        NzButtonModule,
    ],
})
export class CivilExhibitionModule {}
