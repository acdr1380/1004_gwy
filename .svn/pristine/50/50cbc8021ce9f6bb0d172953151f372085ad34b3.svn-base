import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintainComponent } from './maintain.component';
import { PublishComponent } from './publish/publish.component';

import { EditorModule } from '@tinymce/tinymce-angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { SelectUnitLevelModule } from 'app/components/select-unit-level/select-unit-level.module';

const routes: Routes = [
    {
        path: '',
        component: MaintainComponent,
    },
    {
        path: 'publish',
        component: PublishComponent,
    },
];

@NgModule({
    declarations: [MaintainComponent, PublishComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        ScrollingModule,
        OnlineDocModule,
        NzTreeModule,
        NzTabsModule,
        NzTableModule,
        NzCheckboxModule,
        NzDividerModule,
        NzDrawerModule,
        NzFormModule,
        NzModalModule,
        NzTreeSelectModule,
        NzUploadModule,
        NzCardModule,
        NzTagModule,
        NzButtonModule,
        NzSelectModule,
        NzIconModule,
        NzInputModule,
        SelectUnitLevelModule,
    ],
})
export class MaintainModule {}
