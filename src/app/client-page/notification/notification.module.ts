import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent } from './notification.component';
import { EditComponent } from './edit/edit.component';
import { NotificationService } from './notification.service';
import { ReadComponent } from './read/read.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OtherPipeModule } from './db/pipe/other-pipe.module';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SelectOrgModule } from 'app/components/select-org/select-org.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';

const router: Routes = [
    {
        path: '',
        component: NotificationComponent,
    },
    {
        path: 'edit',
        component: EditComponent,
    },
    {
        path: 'read',
        component: ReadComponent,
    },
];

@NgModule({
    declarations: [NotificationComponent, EditComponent, ReadComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(router),
        EditorModule,
        OtherPipeModule,
        ScrollingModule,
        OnlineDocModule,
        NzTabsModule,
        NzInputModule,
        NzTableModule,
        NzCheckboxModule,
        NzDividerModule,
        NzDrawerModule,
        NzFormModule,
        NzUploadModule,
        NzDatePickerModule,
        NzAlertModule,
        NzButtonModule,
        NzCardModule,
        NzTagModule,
        NzSelectModule,
        NzTreeModule,
        NzSpinModule,
        NzRadioModule,
        SelectOrgModule,
        NzModalModule,
        SelectUnitLevelModule,
    ],
    providers: [NotificationService],
})
export class NotificationModule { }
