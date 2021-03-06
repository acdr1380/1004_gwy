import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { A0144EditorComponent } from './a0144-editor/a0144-editor.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { DatetimeInputModule } from './../../components/datetime-input/datetime-input.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ExcelControlModule } from 'app/components/excel-control/excel-control.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormPageComponent } from './form-page.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { A02EditorComponent } from './a02-editor/a02-editor.component';
import { A14EditorComponent } from './a14-editor/a14-editor.component';
import { A15EditorComponent } from './a15-editor/a15-editor.component';
import { A29EditorComponent } from './a29-editor/a29-editor.component';
import { A30EditorComponent } from './a30-editor/a30-editor.component';
import { PopupEditorComponent } from './popup-editor/popup-editor.component';

const routes: Routes = [
    {
        path: '',
        component: FormPageComponent,
    },
];

@NgModule({
    declarations: [
        FormPageComponent,
        A0144EditorComponent,
        A14EditorComponent,
        A15EditorComponent,
        A02EditorComponent,
        A29EditorComponent,
        A30EditorComponent,
        PopupEditorComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        DictionaryInputModule,
        DatetimeInputModule,

        ExcelControlModule,
        NzButtonModule,
        NzDrawerModule,
        NzFormModule,
        NzInputModule,
        NzInputNumberModule,
        NzCardModule,
        NzDividerModule,
        NzTableModule,
        NzModalModule,
    ],
})
export class FormPageModule {}
