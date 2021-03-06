import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareerPersonSalaryComponent } from './career-person-salary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { SelectOrgModule } from 'app/components/select-org/select-org.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { PersonOrderModule } from './person-order/person-order.module';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PersonExhibitionComponent } from './person-exhibition/person-exhibition.component';
import { PersonFormPageComponent } from './person-form-page/person-form-page.component';
import { PersonSalaryComponent } from './person-salary/person-salary.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CropperImagesModule } from 'app/components/cropper-images/cropper-images.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
const routes: Routes = [
    { path: '', component: CareerPersonSalaryComponent },
    {
        path: 'person-exhibition',
        component: PersonExhibitionComponent,
    },
];

@NgModule({
    declarations: [
        CareerPersonSalaryComponent,
        PersonExhibitionComponent,
        PersonFormPageComponent,
        PersonSalaryComponent,
        PersonalDetailsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzTabsModule,
        NzTableModule,
        FormsModule,
        NzDrawerModule,
        ReactiveFormsModule,
        SelectOrgModule,
        NzIconModule,
        NzButtonModule,
        NzDropDownModule,
        NzSelectModule,
        NzAlertModule,
        PersonOrderModule,
        NzCheckboxModule,
        ScrollingModule,
        NzPaginationModule,
        NzSpinModule,
        NzEmptyModule,
        ExcelControlModule,
        DictionaryInputModule,
        NzInputModule,
        NzDatePickerModule,
        NzFormModule,
        CropperImagesModule,
        NzInputNumberModule,
        NzDividerModule,
        NzModalModule,
    ],
})
export class CareerPersonSalaryModule {}
