import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SalaryInnerTransferPersonFileComponent } from './salary-inner-transfer-person-file.component';



@NgModule({
    declarations: [SalaryInnerTransferPersonFileComponent],
    imports: [
        CommonModule,
        NzUploadModule,
        NzButtonModule,
        NzIconModule,

        OnlineDocModule,
    ],
    exports: [SalaryInnerTransferPersonFileComponent],
})
export class SalaryInnerTransferPersonFileModule { }
