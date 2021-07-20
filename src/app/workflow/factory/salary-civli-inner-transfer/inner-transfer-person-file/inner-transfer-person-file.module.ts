import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerTransferPersonFileComponent } from './inner-transfer-person-file.component';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';



@NgModule({
    declarations: [InnerTransferPersonFileComponent],
    imports: [
        CommonModule,
        NzUploadModule,
        NzButtonModule,
        NzIconModule,

        OnlineDocModule,
    ],
    exports: [InnerTransferPersonFileComponent],
})
export class InnerTransferPersonFileModule { }
