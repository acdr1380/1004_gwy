import { CropperImagesService } from './cropper-images.service';
import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';

import Cropper from 'cropperjs';
import { SafeResourceUrl } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cropper-images',
    templateUrl: './cropper-images.component.html',
    styleUrls: ['./cropper-images.component.scss'],
})
export class CropperImagesComponent implements OnInit, AfterViewInit {
    // eg: <cropper-images (photoChange)="cropperPictureIfy.evtPhotoChange($event)"></cropper-images>

    @Output() photoChange = new EventEmitter<any>();

    @ViewChild('imageElement', { static: false }) imageElement: ElementRef;
    @ViewChild('previewsElement', { static: false }) previewsElement: ElementRef;
    cropper: Cropper;

    // 图片上传
    uploadPhtotIfy = {
        loading: false,
        file: <any>{
            url: <SafeResourceUrl>null,
            fix: 'jpg',
        },
        list: [],
        /**
         * 文件上传
         */
        fileCustomRequest: (item: NzUploadFile) => {
            this.uploadPhtotIfy.loading = true;
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            this.uploadPhtotIfy.file = Object.assign(item.file, {
                filename: item.file.name,
                originFileObj: item.file,
            });
            this.service
                .fileUpload(formData)
                .pipe(
                    tap(json => {
                        if (json.code === 0) {
                            const data = json.data;
                            this.uploadPhtotIfy.file.url = `api/gl-file-service/photo/${data.fileId}`; // `api/${data.filePath}`;
                            this.uploadPhtotIfy.file.thumbUrl = this.uploadPhtotIfy.file.url;
                            this.uploadPhtotIfy.file.fix = data.fileType;
                            this.uploadPhtotIfy.list = [this.uploadPhtotIfy.file];
                        }
                    })
                )
                .subscribe(data => {
                    this.uploadPhtotIfy.loading = false;
                });
        },

        /**
         * 删除文件
         */
        fileRemove: (file: NzUploadFile): boolean => {
            this.uploadPhtotIfy.list.splice(0, 1);
            return true;
        },
    };

    constructor(private service: CropperImagesService) {}

    ngOnInit() {}

    ngAfterViewInit() {}

    /**
     * 图片加载完成
     */
    imageLoaded() {
        this.loadCropper();
    }

    /**
     * 图片加载错误
     */
    imageLoadError() {
        // this.uploadPhtotIfy.file.url = 'assets/images/noPictureNoFun.png';
        // this.cropper.destroy();
    }

    /**
     * 加载剪切组件
     */
    loadCropper() {
        if (this.cropper) {
            this.cropper.destroy();
        }
        this.cropper = new Cropper(this.imageElement.nativeElement, {
            dragMode: 'move',
            aspectRatio: 26 / 32,
            autoCropArea: 0.65,
            restore: false,
            guides: false,
            center: false,
            highlight: false,
            // cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
            preview: this.previewsElement.nativeElement,
        });
    }

    /**
     * 确认裁剪
     */
    evtCropperImage() {
        this.cropper.getCroppedCanvas().toBlob(blob => {
            const formData = new FormData();

            // Pass the image file name as the third parameter if necessary.
            const fileName = `${Math.random().toString(36).substr(2)}.${
                this.uploadPhtotIfy.file.fix
            }`;
            formData.append('file', blob, fileName);
            this.service
                .fileUpload(formData)
                .pipe(
                    tap(json => {
                        if (json.code === 0) {
                            const data = json.data;
                            const url = `api/gl-file-service/photo/${data.fileId}`; // `api/${data.filePath}`;
                            const thumbUrl = this.uploadPhtotIfy.file.url;
                            const fix = data.fileType;
                            this.photoChange.emit({ url, ...data });
                        }
                    })
                )
                .subscribe();
        });
    }

    /**
     * 重置照片
     */
    resetURL() {
        this.uploadPhtotIfy.file.url = null;
        if (this.cropper) {
            this.cropper.destroy();
        }
    }
}
