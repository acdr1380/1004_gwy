import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadXHRArgs, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BackInfo } from '../../db/entity/BackInfo';
import { FeedBackEnumList } from '../../db/enum/FeedBackEnum';
import { PolicySendObjectEnum_List } from '../../db/enum/PolicySendObjectEnum';
import { PolicyStatusEnum } from '../../db/enum/PolicyStatusEnum';
import { PolicyInfoVO } from '../../db/vo/PolicyInfoVO';
import { SetClassificationService } from '../../set-classification/set-classification.service';
import { PublishService } from './publish.service';
import { Base64 } from 'js-base64';
import { WorkflowService } from 'app/workflow/workflow.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';

// 必须引入才能显示编辑器图标
import 'tinymce/icons/default';
import { SelectUnitLevelDrawerComponent } from 'app/components/select-unit-level/select-unit-level-drawer/select-unit-level-drawer.component';
import { AppConfig } from 'app/app.config';

@Component({
    selector: 'app-publish',
    templateUrl: './publish.component.html',
    styleUrls: ['./publish.component.scss'],
})
export class PublishComponent implements OnInit, OnDestroy {
    protected appSettings = AppConfig.settings;
    constructor(
        private clientService: ClientService,
        private workflowService: WorkflowService,
        private common: CommonService,
        private service: PublishService,
        private message: NzMessageService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private modalService: NzModalService,
        private setTypeService: SetClassificationService,
        private commonService: CommonService
    ) {}

    /**
     * 发送对象类型
     */
    PolicySendObjectList = PolicySendObjectEnum_List;

    feedBackEnumList = FeedBackEnumList;
    // 政策内容编辑框
    @ViewChild('contentEditElement', { static: false }) _contentEditElement: EditorComponent;
    /**
     * 政策类型
     */
    policyTypeNodes = [];

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 发布政策填写相关
     */
    policyify = {
        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            documentNumber: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            sendOrgInfos: new FormControl(null),
            groupId: new FormControl(null, Validators.required),
            status: new FormControl(null),
        }),
        /**
         * 政策附件
         */
        fileList: <Array<NzUploadFile>>[],
        /**
         * 文件上传
         */
        fileCustomRequest: (item: NzUploadXHRArgs) => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            const uploadItem = Object.assign(item.file, {
                fileName: item.file.name,
                // originFileObj: item.file,
            });

            this.policyify.fileList.push(uploadItem);
            this.common.fileUpload(formData).subscribe(data => {
                // uploadItem.url = `api/gl-file-service/static/attachment/${data.fileId}?fileName=${data.fileName}`;
                uploadItem.url = `${this.commonService.getOpenFileURL(data.fileId, data.fileName)}`;
                uploadItem.thumbUrl = uploadItem.url;
                uploadItem.fix = data.fileType;
                this.policyify.fileList = [...this.policyify.fileList];
            });
        },
        /**
         * 删除文件
         */
        fileRemove: (file: NzUploadFile): boolean => {
            const _index = this.policyify.fileList.findIndex(x => x.fileId === file.fileId);
            this.policyify.fileList.splice(_index, 1);
            this.policyify.fileList = [...this.policyify.fileList];
            return true;
        },
        /**
         * 政策发送单位
         */
        sendUnits: [],
        selectedIndex: 0,
        showFile: (file: NzUploadFile) => {
            const _index = this.policyify.fileList.findIndex(x => x.fileId === file.fileId);
            this.policyify.selectedIndex = _index;
            this.onlineDocOverlayElement.show();
            return;
        },
    };

    /**
     * 编辑框
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
            formData.append('file', file as any, file.name);
            this.common.fileUpload(formData).subscribe(json => {
                if (json.code === 0) {
                    const result = json.data;
                    file.operFiles = result;
                    succFun(
                        `${document.baseURI}/api/gl-file-service/attachment/${result.id}?fileName=${result.fileName}`
                    );
                } else {
                    failFun('Invalid JSON: ' + json.msg);
                }
            });
        },
    };

    /**
     * 路由参数
     */
    URLParams = {
        policyId: null,
        isEdit: true,
        isSpinning: false,
    };

    /**
     * 是否有未处理的反馈意见
     */
    flag: boolean;
    /**
     * 未处理的反馈信息
     */
    backList = {
        dataAll: <Array<BackInfo>>[],
        data: <Array<BackInfo>>[],
        selectedIndex: 0,
        change: ({ index }) => {
            this.backList.selectedIndex = index;
            this.backList.filterFeedBack();
        },
        filterFeedBack: () => {
            this.backList.data = this.backList.dataAll.filter(
                v => v.operation === this.backList.selectedIndex
            );
            this.backList.data = [...this.backList.data];
        },
    };

    @ViewChild('selectOrgDrawerTemp', { static: false })
    _selectOrgDrawerTemp: SelectUnitLevelDrawerComponent;

    ngOnInit() {
        this.loadPolicyTypeList();

        // 路由参数
        this.activeRoute.params.subscribe(param => {
            // 判断路由参数是否存在
            if (param['GL']) {
                this.URLParams = JSON.parse(Base64.decode(param['GL']));
                // 政策信息是否可编辑
                if (!this.URLParams.isEdit) {
                    this.setFormDisabled();
                }
                this.loadPolicyData();
                this.loadBackSubList();
            }
        });

        // 面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                icon: 'left',
                text: '返回',
                type: 'event',
                event: () => this.router.navigate(['client/policy/maintain']),
            },
            {
                text: '政策维护',
                type: 'event',
                event: () => this.router.navigate(['client/policy/maintain']),
            },
            {
                type: 'text',
                text: '发布政策',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 禁用政策信息表单
     */
    setFormDisabled() {
        const controls = this.policyify.form.controls;
        for (const key in controls) {
            if (controls.hasOwnProperty(key)) {
                const control: AbstractControl = this.policyify.form.get(key);
                control.disable();
            }
        }
    }

    /**
     * 加载所有政策类型
     */
    loadPolicyTypeList() {
        this.setTypeService.getPolicyTypeAll().subscribe(result => {
            if (result) {
                this.policyTypeNodes = result;
            }
        });
    }

    /**
     * 取当前政策相关数据
     */
    loadPolicyData() {
        this.service.getPolicyData(this.URLParams.policyId).subscribe(result => {
            this.flag = result.flag;
            this.policyify.sendUnits = result.sendOrgResults;
            // 表单赋值
            this.policyify.form.patchValue(result);
            this.syncPolicyifyForm();
            this.policyify.fileList = result.attachmentInfos.map(item => {
                return <any>{
                    ...item,
                    thumbUrl: item.url,
                    name: item.fileName,
                    uid: item.id,
                    fileName: item.fileName,
                };
            });
        });
    }

    /**
     * 取反馈信息
     */
    loadBackSubList() {
        this.service.getBackSubList(this.URLParams.policyId).subscribe(result => {
            this.backList.dataAll = result;
            this.backList.filterFeedBack();
        });
    }

    // 类型转换
    getTypeEn(value) {
        const item = this.feedBackEnumList.find(v => v.value === value);
        return item ? item.text : '';
    }

    /**
     * 处理反馈意见，更新数据
     */
    evtOperationChange(status: boolean, item: BackInfo) {
        const data = {
            backId: item.backId,
            operation: Number(status),
        };
        this.service.updateOperation(data).subscribe(
            result => {
                if (result) {
                    this.message.success('更新成功。');
                    const index = this.backList.dataAll.findIndex(v => v.backId === result.backId);
                    this.backList.dataAll[index] = result;
                    this.backList.filterFeedBack();
                }
            },
            ({ error }) => {
                this.message.error(error.msg);
            }
        );
    }

    /**
     * 确认发布
     */
    savePolicyData(isPublish: boolean = false) {
        if (this.common.formVerify(this.policyify.form)) {
            const attachments = this.policyify.fileList.map((item: NzUploadFile) => ({
                fileName: item.fileName,
                url: item.url,
                size: item.size,
                type: item.fix,
            }));
            // 编辑框数据
            const editorText = this._contentEditElement.editor.getContent({ format: 'text' });
            const data: PolicyInfoVO = this.policyify.form.getRawValue();
            data.contentText = editorText;
            data.attachmentInfos = <any>attachments;
            // 无反馈意见时
            if (!this.flag) {
                data.status = isPublish ? PolicyStatusEnum.NORMAL : PolicyStatusEnum.DRAFT;
            }

            if (isPublish) {
                const orgList = this.policyify.form.get('sendOrgInfos').value;
                if (!orgList || orgList.length === 0) {
                    this.message.error('未选择发送单位。');
                    return;
                }
            }
            // 存在政策数据更新
            if (this.URLParams.policyId) {
                data.policyId = this.URLParams.policyId;
                this.service.updatePolicyData(data).subscribe(result => {
                    if (result) {
                        this.savePolicyDataed(result, isPublish);
                    }
                });
                return;
            }
            // 新发起保存
            this.service.savePolicyData(data).subscribe(result => {
                if (result.policyId) {
                    this.savePolicyDataed(result, isPublish);
                }
            });
        }
    }

    /**
     * 保存政策信息
     */
    savePolicyDataed(result: PolicyInfoVO, isPublish: boolean) {
        if (!isPublish) {
            this.message.success('保存成功。');
            const params = {
                policyId: result.policyId,
                isEdit: result.status === PolicyStatusEnum.DRAFT || this.flag,
            };
            // 构造路由参数加密
            const GL = Base64.encode(JSON.stringify(params));
            this.router.navigate(['client/policy/maintain/publish', { GL }]);
            return;
        }
        this.message.success('发布成功。');
        // 跳转路由
        this.router.navigate(['client/policy/maintain']);
    }

    /**
     * 撤销政策草稿
     */
    deletePolicyData() {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除此政策吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.URLParams.isSpinning = true;
                this.service.deletePolicyData(this.URLParams.policyId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除成功。');
                        // 跳转界面
                        this.router.navigate(['client/policy/maintain']);
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }

    /**
     * 加载机构树
     */
    selectSendUnits() {
        this._selectOrgDrawerTemp.open();
    }

    /**
     * 确认发送选择单位
     */
    selectedUnits(nodeLists) {
        const data: Array<any> = nodeLists.map(v => {
            return {
                orgName: v.title,
                orgId: v.key,
                includeChild: !!v.origin.includeChild,
            };
        });
        // const oldUnits = this.policyify.sendUnits.filter(v =>
        //     this.unitSelectorDrawer.cancelUnits.has(v.orgId)
        // );
        this.common.getCheckedTreeNodeCount([...data]).subscribe(result => {
            if (result) {
                this.policyify.sendUnits = result;
                this.syncPolicyifyForm();
            }
        });
    }

    delSendObject(index) {
        const [closenode] = this.policyify.sendUnits.splice(index, 1);

        this.syncPolicyifyForm();
    }
    // 清空发送单位
    clearAllUnits() {
        this.policyify.sendUnits = [];
        this.syncPolicyifyForm();
    }

    /**
     * 发送对象赋值
     */
    syncPolicyifyForm() {
        this.policyify.form.patchValue({ sendOrgInfos: this.policyify.sendUnits });
    }
}
