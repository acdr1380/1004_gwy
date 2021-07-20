import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CivilPersonSalaryComponent } from './civil-person-salary.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectOrgModule } from 'app/components/select-org/select-org.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PersonOrderModule } from './person-order/person-order.module';
import { NzAlertModule } from 'ng-zorro-antd/alert';

const routes: Routes = [
    { path: '', component: CivilPersonSalaryComponent },
    {
        path: 'civil-exhibition',
        loadChildren: () =>
            import('./civil-exhibition/civil-exhibition.module').then(m => m.CivilExhibitionModule),
    },
];

@NgModule({
    declarations: [CivilPersonSalaryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        SelectOrgModule,
        ScrollingModule,
        NzCheckboxModule,
        NzTreeModule,
        NzTableModule,
        NzSelectModule,
        NzDrawerModule,
        DictionaryInputModule,
        DragDropModule,
        NzButtonModule,
        NzIconModule,
        NzDropDownModule,
        NzRadioModule,
        NzTabsModule,
        PersonOrderModule,
        NzAlertModule,
    ],
})
export class CivilPersonSalaryModule {}
