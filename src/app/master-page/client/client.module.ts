import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientComponent } from './client.component';
import { ClientPageModule } from 'app/client-page/client-page.module';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';

@NgModule({
    declarations: [ClientComponent],
    imports: [
        CommonModule,
        ClientPageModule,
        NzIconModule,
        NzMenuModule,
        NzBreadCrumbModule,
        NzLayoutModule,
        NzDrawerModule,

        FormsModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzAlertModule,
        NzToolTipModule,

        DictionaryInputModule,
    ],
})
export class ClientModule {}
