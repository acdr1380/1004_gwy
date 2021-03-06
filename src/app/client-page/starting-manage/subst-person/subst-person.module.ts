import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubstPersonComponent } from './subst-person.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';

const routes: Routes = [{ path: '', component: SubstPersonComponent }];

@NgModule({
    declarations: [SubstPersonComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NzDatePickerModule,
        NzButtonModule,
        NzInputModule,
        NzDrawerModule,
        NzIconModule,
        NzTabsModule,
        NzSelectModule,
        ScrollingModule,
        NzFormModule,
        NzTableModule,
        NzUploadModule,

        DictionaryInputModule,
        DatetimeInputModule,
        NzInputNumberModule,
    ],
})
export class SubstPersonModule { }
