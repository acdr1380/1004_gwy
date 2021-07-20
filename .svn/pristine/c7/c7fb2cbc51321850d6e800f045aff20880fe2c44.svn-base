import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index.component';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { OperWorkbenchComponent } from './oper-workbench/oper-workbench.component';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';

const routes: Routes = [
    { path: '', component: IndexComponent },
    { path: 'oper-workbench', component: OperWorkbenchComponent },
];

@NgModule({
    declarations: [IndexComponent, OperWorkbenchComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NzCalendarModule,
        NzTabsModule,
        NzTableModule,
        FormsModule,
        ReactiveFormsModule,
        NzStepsModule,
        NzDrawerModule,
        NzTimelineModule,
        NzIconModule,
        NzInputModule,
        NzUploadModule,
        NzButtonModule,
        OnlineDocModule,
    ],
})
export class IndexModule {}
