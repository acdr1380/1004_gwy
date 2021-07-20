import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CivilWorkChangeComponent } from './civil-work-change.component';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
@NgModule({
    declarations: [CivilWorkChangeComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NzDrawerModule,
        NzTableModule,
        NzUploadModule,
        NzButtonModule,

        DictionaryInputModule,
        OnlineDocModule,
        DatetimeInputModule,
    ],
    providers: [DatePipe],
    exports: [CivilWorkChangeComponent],
})
export class CivilWorkChangeModule { }
