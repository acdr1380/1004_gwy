import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TibetPersonEnterFileComponent } from './tibet-person-enter-file.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { OnlineDocModule } from 'app/components/online-doc/online-doc.module';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

@NgModule({
  declarations: [TibetPersonEnterFileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzUploadModule,
    OnlineDocModule,
    NzDrawerModule,
  ],
  exports: [TibetPersonEnterFileComponent]
})
export class TibetPersonEnterFileModule { }
