import { CommonService } from 'app/util/common.service';
import {
    Component,
    ElementRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    OnInit,
    Input,
    ViewChildren,
    QueryList,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortalDirective } from '@angular/cdk/portal';
import { FileTypeEnum } from './enums/fileTypeEnum';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gl-online-doc',
    templateUrl: './online-doc.component.html',
    styleUrls: ['./online-doc.component.scss'],
})
export class OnlineDocComponent implements OnInit {
    @ViewChildren('fileMultiMains') fileMultiMains: QueryList<ElementRef>;
    fileTypeEnum = FileTypeEnum;
    imgExt = new Array('png', 'jpg', 'jpeg', 'bmp', 'gif'); // 图片文件的后缀名
    pdfExt = new Array('pdf'); // pdf文件后缀
    docExt = new Array('doc', 'docx'); // word文件的后缀名
    xlsExt = new Array('xls', 'xlsx'); // excel文件的后缀名
    /**
     * 文件列表
     */
    _fileList: any[]; // { fileName, url}
    @Input()
    set fileList(value) {
        this._fileList = value.map(file => {
            const { fileName, fileId } = file;
            const url = this.commonService.getOpenFileURL(fileId);
            let type = null;
            if (this.imgExt.indexOf(file.fileType.toLocaleLowerCase()) > -1) {
                type = FileTypeEnum.img;
            }
            if (this.pdfExt.indexOf(file.fileType.toLocaleLowerCase()) > -1) {
                type = FileTypeEnum.pdf;
            }
            return {
                ...file,
                fileName,
                fileId,
                resourceUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
                type,
            };
        });
    }
    get fileList() {
        return this._fileList;
    }

    /**
     * 选中索引
     */
    @Input() selectedIndex = 0;

    showThumbnails = false;

    @ViewChild('overlayGlobalTemplate', { static: false })
    templateGlobalPortals: TemplatePortalDirective;
    private overlayRef: OverlayRef;
    constructor(
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef,
        private sanitizer: DomSanitizer,
        private commonService: CommonService
    ) {}

    ngOnInit() {}

    /**
     * 显示在线预览
     */
    public show() {
        // config: OverlayConfig overlay的配置，配置显示位置，和滑动策略
        const config = new OverlayConfig();
        config.positionStrategy = this.overlay
            .position()
            .global() // 全局显示
            .centerHorizontally() // 水平居中
            .centerVertically(); // 垂直居中
        config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
        config.backdropClass = 'overlay-shade';
        this.overlayRef = this.overlay.create(config); // OverlayRef, overlay层
        this.overlayRef.backdropClick().subscribe(() => {
            // 点击了backdrop背景
            this.overlayRef.dispose();
        });
        // OverlayPanelComponent是动态组件
        // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
        this.overlayRef.attach(this.templateGlobalPortals);
        // 监听overlayRef上的键盘按键事件
        this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.keyCode === 37) {
                this.last();
            }
            if (event.keyCode === 39) {
                this.next();
            }
            if (event.keyCode === 27) {
                this.overlayRef.dispose();
            }
        });
    }

    /**
     * 关闭预览
     */
    public close() {
        this.overlayRef.dispose();
    }

    /**
     * 放大
     */
    plus() {
        const el = this.fileMultiMains.toArray()[this.selectedIndex].nativeElement;
        const img = el.querySelector('img');
        let incrementW = img.getAttribute('increment-w');
        let incrementH = img.getAttribute('increment-h');
        if (!(incrementW && incrementH)) {
            incrementW = img.clientWidth * 0.1;
            img.setAttribute('increment-w', incrementW);
            incrementH = img.clientHeight * 0.1;
            img.setAttribute('increment-h', incrementH);
        }
        // img.style.maxWidth = img.clientWidth + parseFloat(incrementW) + 'px';
        img.style.maxHeight = img.clientHeight + parseFloat(incrementH) + 'px';
    }

    /**
     * 缩小
     */
    minus() {
        const el = this.fileMultiMains.toArray()[this.selectedIndex].nativeElement;
        const img = el.querySelector('img');
        let incrementW = img.getAttribute('increment-w');
        let incrementH = img.getAttribute('increment-h');
        if (!(incrementW && incrementH)) {
            incrementW = img.clientWidth * 0.1;
            img.setAttribute('increment-w', incrementW);
            incrementH = img.clientHeight * 0.1;
            img.setAttribute('increment-h', incrementH);
        }
        // img.style.maxWidth = img.clientWidth - parseFloat(incrementW) + 'px';
        img.style.maxHeight = img.clientHeight - parseFloat(incrementH) + 'px';
    }

    /**
     * 左转
     */
    leftRotate() {
        const item = this.fileList[this.selectedIndex];
        const el = this.fileMultiMains.toArray()[this.selectedIndex].nativeElement;
        const img = el.querySelector('img');
        item.current = ((item.current || 0) - 90) % 360;
        img.style.transform = 'rotate(' + item.current + 'deg)';
    }

    /**
     * 右转
     */
    rightRotate() {
        const item = this.fileList[this.selectedIndex];
        const el = this.fileMultiMains.toArray()[this.selectedIndex].nativeElement;
        const img = el.querySelector('img');
        item.current = ((item.current || 0) + 90) % 360;
        img.style.transform = 'rotate(' + item.current + 'deg)';
    }

    /**
     * 选中
     * @param index 索引
     */
    select(index) {
        this.selectedIndex = index;
    }

    /**
     * 下一个
     */
    public next() {
        if (this.selectedIndex >= this.fileList.length - 1) {
            return;
        }
        this.selectedIndex = this.selectedIndex + 1;
    }

    /**
     * 上一个
     */
    public last() {
        if (this.selectedIndex <= 0) {
            return;
        }
        this.selectedIndex = this.selectedIndex - 1;
    }

    /**
     * 缩略图
     */
    thumbnails() {
        this.showThumbnails = !this.showThumbnails;
    }

    /**
     * 下载文件
     */
    public down() {
        const { fileId, fileName } = this.fileList[this.selectedIndex];
        const url = this.commonService.getDownFileURL(fileId, fileName);

        this.commonService.downFileGet(url);
    }

    /**
     * 图片类型
     */
    getSelectImage() {
        const item = this.fileList[this.selectedIndex];
        if (!item) {
            return false;
        }
        return item.type === FileTypeEnum.img;
    }

    /**
     * 构建预览缩略图 图标
     */
    buildThumbUrl(list) {
        return list.map(item => {
            const suffList = [
                'avi',
                'bmp',
                'xls',
                'ext',
                'flv',
                'gif',
                'jpeg',
                'jpg',
                'pdf',
                'png',
                'ppt',
                'rar',
                'tiff',
                'txt',
                'doc',
                'zip',
            ];
            if (this.imgExt.indexOf(item.fileType.toLocaleLowerCase()) === -1) {
                item.thumbUrl =
                    suffList.indexOf(item.fileType) > -1
                        ? `assets/images/component/${item.fileType}.png`
                        : `assets/images/component/other.png`;
            }
            return item;
        });
    }

    /**
     * 构建缩略图 通过文件类型
     */
    buildThumbUrlToType(fileType) {
        const suffList = [
            'avi',
            'bmp',
            'xls',
            'ext',
            'flv',
            'gif',
            'jpeg',
            'jpg',
            'pdf',
            'png',
            'ppt',
            'rar',
            'tiff',
            'txt',
            'doc',
            'zip',
        ];
        let thumbUrl = '';
        if (this.imgExt.indexOf(fileType.toLocaleLowerCase()) === -1) {
            thumbUrl =
                suffList.indexOf(fileType) > -1
                    ? `assets/images/component/${fileType}.png`
                    : `assets/images/component/other.png`;
        }
        return thumbUrl;
    }
}
