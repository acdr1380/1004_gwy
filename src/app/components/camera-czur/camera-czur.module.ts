import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LoadingModule } from './../loading/loading.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraCZURComponent } from '../camera-czur/camera-czur.component';

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [CameraCZURComponent],
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        LoadingModule,
        NzToolTipModule,
        NzDrawerModule,
        FormsModule,
        NzButtonModule,
        NzInputModule,
        FormsModule,
        ReactiveFormsModule,
        NzFormModule,
        NzSelectModule,
    ],
    exports: [CameraCZURComponent],
})
export class CameraCZURModule {}
