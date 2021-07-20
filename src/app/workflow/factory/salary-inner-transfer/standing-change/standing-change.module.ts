import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandingChangeComponent } from './standing-change.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { DatetimeInputModule } from 'app/components/datetime-input/datetime-input.module';
@NgModule({
    declarations: [StandingChangeComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NzDrawerModule,
        NzTableModule,
        NzUploadModule,
        NzButtonModule,

        OnlineDocModule,
        DictionaryInputModule,
        DatetimeInputModule,

    ],
    exports: [StandingChangeComponent],
})
export class StandingChangeModule { }
