import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CropperImagesComponent } from './cropper-images.component';

import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
    declarations: [CropperImagesComponent],
    imports: [CommonModule, NzUploadModule, NzSpinModule, NzButtonModule],
    exports: [CropperImagesComponent],
})
export class CropperImagesModule {}
