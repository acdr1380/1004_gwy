import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IsTeacherTableComponent } from './is-teacher-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
@NgModule({
    declarations: [IsTeacherTableComponent],
    imports: [
        CommonModule,
        DictionaryInputModule,
        DatetimeInputModule,

        FormsModule,
        ReactiveFormsModule,
        OnlineDocModule,
        NzButtonModule,
        NzDrawerModule,
        NzTableModule,
        NzUploadModule,
    ],
    exports: [IsTeacherTableComponent],
})
export class IsTeacherTableModule { }
