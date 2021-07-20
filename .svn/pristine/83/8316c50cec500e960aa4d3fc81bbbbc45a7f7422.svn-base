import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkChangeComponent } from './work-change.component';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
@NgModule({
    declarations: [WorkChangeComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DictionaryInputModule,
        OnlineDocModule,
        DatetimeInputModule,
        NzTableModule,
        NzDrawerModule,
        NzUploadModule,
        NzButtonModule,
    ],
    providers: [DatePipe],
    exports: [WorkChangeComponent],
})
export class WorkChangeModule {}
