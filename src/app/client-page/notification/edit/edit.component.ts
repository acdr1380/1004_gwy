import { SelectUnitLevelDrawerComponent } from 'app/components/select-unit-level/select-unit-level-drawer/select-unit-level-drawer.component';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ParamMap, ActivatedRoute, Router } from '@angular/router';
import { Base64 } from 'js-base64';
import { NotificationService } from '../notification.service';
import { CommonService } from 'app/util/common.service';
import { SendNoticeStatusEnum } from '../db/enums/SendNoticeStatusEnum';
import { SendNoticeInfoVO } from '../db/vo/SendNoticeInfoVO';
import { NoticeAttachmentInfo } from '../db/entity/NoticeAttachmentInfo';
import { environment } from 'environments/environment';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ClientService } from 'app/master-page/client/client.service';
import 'tinymce/icons/default';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
    /**
     * 通知表单相关
     */
    noticesIfy = {
        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            type: new FormControl(0, Validators.required),
            endTime: new FormControl(null, Validators.required),
            sendOrgInfos: new FormControl(null),
        }),
        fileList: <NzUploadFile[]>[],
        sendUnits: [],
        save_loading: false,
    };

    /**
     * 路由参数
     */
    URLParams = {
        noticeId: null,
        isEdit: true,
        selectedTabIndex: 0,
    };

    @ViewChild('selectUnitDrawer', { static: false })
    _selectOrgDrawerTemp: SelectUnitLevelDrawerComponent;
    /**
     * 单位相关
     */
    unitSelectorify = {
        width: 500,
        visible: false,
        evtSelected: nodeLists => {
            const data: Array<any> = nodeLists.map(v => {
                return {
                    orgName: v.title,
                    orgId: v.key,
                    includeChild: !!v.origin.includeChild,
                };
            });
            this.commonService.getCheckedTreeNodeCount(data).subscribe(result => {
                if (result) {
                    this.noticesIfy.sendUnits = result;
                    this.noticesIfy.form.patchValue({ sendOrgInfos: this.noticesIfy.sendUnits });
                }
            });
        },
        // 选择发送单位
        selectSendUnits: () => {
            this._selectOrgDrawerTemp.open();
        },
        // 撤选所选单位
        delSendObject: index => {
            let unitArray = [];
            const [delitem] = this.noticesIfy.sendUnits.splice(index, 1);
            unitArray.push(delitem.orgId);
            this.noticesIfy.form.patchValue({ sendOrgInfos: this.noticesIfy.sendUnits });
            this._selectOrgDrawerTemp.setCheckincludeChild(unitArray, false);
        },
        // 清空发送单位
        clearAllUnits: () => {
            let unitArray = [];
            this.noticesIfy.sendUnits.forEach(ele => unitArray.push(ele.orgId));
            this._selectOrgDrawerTemp.setCheckincludeChild(this.noticesIfy.sendUnits, false);
            this.noticesIfy.sendUnits = [];
            this.noticesIfy.form.patchValue({ sendOrgInfos: this.noticesIfy.sendUnits });
        },
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 上传附件
     */
    fileUploadify = {
        selectedIndex: 0,
        // 上传
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file);
            this.common.fileUpload(formData).subscribe(result => {
                result.url = result.filePath = `${this.common.getOpenFileURL(
                    result.fileId,
                    result.fileName
                )}`;
                const fileObj = Object.assign(item.file, result);
                fileObj.operFiles = result;
                this.noticesIfy.fileList.push(fileObj);
                this.noticesIfy.fileList = [...this.noticesIfy.fileList];
            });
        },
        // 删除
        fileRemove: (file: NzUploadFile): boolean => {
            const _index = this.noticesIfy.fileList.findIndex(x => x.url === file.url);
            this.noticesIfy.fileList.splice(_index, 1);
            this.noticesIfy.fileList = [...this.noticesIfy.fileList];
            return true;
        },
        // 查看
        preview: (file: NzUploadFile) => {
            const _index = this.noticesIfy.fileList.findIndex(x => x.url === file.url);
            this.fileUploadify.selectedIndex = _index;
            this.onlineDocOverlayElement.show();
            return false;
        },
    };

    /**
     * 富文本编辑器
     */
    editParam = {
        // base_url: '/tinymce', // Root for resources
        // suffix: '.min', // Suffix to use when loading resources
        selector: 'textarea',
        // plugins是tinymce的各种插件
        plugins:
            'link lists image code table colorpicker textcolor wordcount contextmenu codesample fullscreen',
        // 语言包可以使用tinymce提供的网址,但是墙的原因,会连不上,所以还是自行下载,放到assets里面
        language_url: 'assets/lib/tinymce/zh_CN.js',
        language: 'zh_CN',
        // toolbar定义快捷栏的操作, | 用来分隔显示
        toolbar:
            'bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft' +
            ' aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo ' +
            '| link unlink image code | removeformat | h2 h3 h4 | fullscreen',
        height: 400,
        branding: false,
        statusbar: false,

        convert_urls: false,
        image_caption: true,
        paste_data_images: true,
        images_upload_handler: (blobInfo, succFun, failFun) => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            const file = blobInfo.blob(); // 转化为易于理解的file对象
            // tslint:disable-next-line:no-any
            formData.append('file', file as any, file.name);
            // const file = Object.assign(item.file, {
            //     fileName: item.file.name,
            // });
            // this.upload.uploadIfy.list.push(file);
            this.service.fileUpload(formData).subscribe(json => {
                if (json.code === 0) {
                    const result = json.data;
                    file.url = result.filePath = `${this.common.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    file.operFiles = result;

                    succFun(
                        `${document.baseURI}${this.common.getDownFileURL(
                            result.id,
                            result.fileName
                        )}`
                    );
                } else {
                    failFun('Invalid JSON: ' + json.msg);
                }
            });

            // let xhr, formData;
            // const file = blobInfo.blob(); // 转化为易于理解的file对象
            // xhr = new XMLHttpRequest();
            // xhr.withCredentials = false;
            // xhr.open('POST', 'api/gl-file-service/attachment/upload');
            // xhr.onload = function () {
            //     let json;
            //     if (xhr.status !== 200) {
            //         failFun('HTTP Error: ' + xhr.status);
            //         return;
            //     }
            //     json = JSON.parse(xhr.responseText);
            //     const data = json.data;
            //     if (!data || typeof data.id !== 'string') {
            //         failFun('Invalid JSON: ' + xhr.responseText);
            //         return;
            //     }
            //     // const prefix = environment.config.PROJECT_PATH_ROOT
            //     //     ? `/${environment.config.PROJECT_PATH_ROOT}`
            //     //     : '';
            //     succFun(`/api/gl-file-service/attachment/${data.id}`);
            // };
            // formData = new FormData();
            // formData.append('file', file, file.name); // 此处与源文档不一样
            // xhr.send(formData);
        },
    };

    disabledStartDate = (startValue: Date): boolean => {
        if (!startValue) {
            return false;
        }
        return (
            startValue.getTime() < new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime()
        );
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private service: NotificationService,
        private clientService: ClientService,
        private router: Router,
        private common: CommonService,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    ngOnInit() {
        this.noticesIfy.form.valueChanges.pipe(map(data => data.type)).subscribe(value => {
            const control: AbstractControl = this.noticesIfy.form.get('endTime');
            if (value === 0) {
                control.clearValidators();
            } else {
                control.setValidators(Validators.required);
            }
        });
        this.initRouterParams();

        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                text: '通知管理',
                type: 'event',
                event: () => {
                    this.router.navigate([
                        'client/notification',
                        { selectedTabIndex: this.URLParams.selectedTabIndex },
                    ]);
                },
            },
            {
                type: 'text',
                text: '发布通知',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                if (this.URLParams.noticeId) {
                    this.loadNoticeData();
                }

                if (!this.URLParams.isEdit) {
                    this.setFormDisabled();
                }
            }
        });
    }

    /**
     * 只读，设置表单禁用
     */
    setFormDisabled() {
        const controls = this.noticesIfy.form.controls;
        for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
                const control: AbstractControl = this.noticesIfy.form.get(key);
                control.disable();
            }
        }
    }

    /**
     * 加载通知详情
     */
    loadNoticeData() {
        this.service.getNoticeData(this.URLParams.noticeId).subscribe(result => {
            this.noticesIfy.sendUnits = result.sendOrgResults;
            this.noticesIfy.form.patchValue(result);
            this.noticesIfy.form.patchValue({ sendOrgInfos: this.noticesIfy.sendUnits });
            this.noticesIfy.fileList = result.noticeAttachmentInfos.map(item => {
                return <any>{
                    ...item,
                    thumbUrl: item.url,
                    name: item.fileName,
                    filename: item.fileName,
                    fileType: item.type,
                    fileId: item.url,
                };
            });
        });
    }

    /**
     * 发布通知/保存草稿
     */
    saveNoticeData(isPublish: boolean = false) {
        if (this.common.formVerify(this.noticesIfy.form)) {
            this.noticesIfy.save_loading = true;
            const attachments: NoticeAttachmentInfo[] = this.noticesIfy.fileList.map(
                (item: NzUploadFile) =>
                    <NoticeAttachmentInfo>{
                        fileName: item.fileName,
                        url: item.fileId,
                        size: item.size,
                        type: item.fileType,
                    }
            );
            // 取表单数据参数
            const data: SendNoticeInfoVO = this.noticesIfy.form.getRawValue();
            data.noticeAttachmentInfos = attachments;
            if (isPublish) {
                data.status = SendNoticeStatusEnum.NORMAL;
                const orgList = this.noticesIfy.form.get('sendOrgInfos').value;
                if (!orgList || orgList.length === 0) {
                    this.message.error('未选择发送单位。');
                    this.noticesIfy.save_loading = false;
                    return;
                }
            }
            if (this.URLParams.noticeId) {
                data.noticeId = this.URLParams.noticeId;
                this.service.updateNoticeData(data).subscribe(result => {
                    if (result) {
                        this.message.success('通知内容更新成功。');
                        this.noticesIfy.save_loading = false;
                        if (isPublish) {
                            this.router.navigate(['client/notification']);
                        }
                    }
                });
                return;
            }

            if (!isPublish) {
                data.status = SendNoticeStatusEnum.DRAFT;
            }
            this.service.saveNoticeData(data).subscribe(result => {
                this.noticesIfy.save_loading = false;
                if (result) {
                    this.message.success('通知内容更新成功。');

                    if (isPublish) {
                        this.router.navigate(['client/notification']);
                    } else {
                        const params = {
                            noticeId: result.noticeId,
                            isEdit: result.status === SendNoticeStatusEnum.DRAFT,
                        };
                        const GL = Base64.encode(JSON.stringify(params));
                        this.router.navigate(['/client/notification/edit', { GL }]);
                    }
                }
            });
        }
    }
}
