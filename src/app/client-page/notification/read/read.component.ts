import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Base64 } from 'js-base64';
import { NotificationService } from '../notification.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { OpinionAttachmentInfo } from '../db/entity/OpinionAttachmentInfo';
import { OpinionInfoVO } from '../db/vo/OpinionInfoVO';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ClientService } from 'app/master-page/client/client.service';
import { SelectUnitLevelDrawerComponent } from 'app/components/select-unit-level/select-unit-level-drawer/select-unit-level-drawer.component';

@Component({
    selector: 'app-read',
    templateUrl: './read.component.html',
    styleUrls: ['./read.component.scss'],
})
export class ReadComponent implements OnInit, OnDestroy {
    /**
     * 通知内容详情
     */
    noticeInfo = {
        title: null,
        sendTime: null,
        orgName: null,
        content: null,
        type: null,
        showType: null,
        selectedIndex: 0,
        noticefileList: [],
        preview: (file: NzUploadFile) => {
            const _index = this.noticeInfo.noticefileList.findIndex(x => x.url === file.url);
            this.noticeInfo.selectedIndex = _index;
            this.onlineDocOverlayElement1.show();
            return false;
        },
    };

    /**
     * 主界面通知内容相关
     */
    noticesIfy = {
        form: new FormGroup({
            content: new FormControl(null, Validators.required),
            endTime: new FormControl({ value: null, disabled: true }),
            opinionId: new FormControl(null),
        }),
        fileList: [],
        isEdit: false,
        selectedIndex: 0,
        preview: (file: NzUploadFile) => {
            const _index = this.noticesIfy.fileList.findIndex(x => x.url === file.url);
            this.noticesIfy.selectedIndex = _index;
            this.onlineDocOverlayElement2.show();
            return false;
        },
    };

    /**
     * 通知转发抽屉
     */
    transpondify = {
        visible: false,
        placement: 'right',
        title: '通知转发',
        width: 520,
        close: () => (this.transpondify.visible = false),
        open: () => (this.transpondify.visible = true),
        form: new FormGroup({
            remark: new FormControl(null),
            sendOrgInfos: new FormControl(null, Validators.required),
        }),
        transpondUnits: [],
        loadingstatus: false,

        /**
         * 当前选中单位
         */
        sendUnits: [],
        /**
         * 转发时是否选择单位
         */
        isGetTranspondUnits: false,
    };

    @ViewChild('selectOrgDrawerTemp', { static: false })
    _selectOrgDrawerTemp: SelectUnitLevelDrawerComponent;
    /**
     * 单位相关
     */
    unitSelectorify = {
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
                    this.transpondify.sendUnits = result;
                    this.transpondify.form.patchValue({
                        sendOrgInfos: this.transpondify.sendUnits,
                    });
                }
            });
        },
        // 选择单位
        selectorUnit: () => {
            this._selectOrgDrawerTemp.open();
        },
        // 清空所选单位
        clearAll: () => {
            let unitArray = [];
            this.transpondify.sendUnits.forEach(ele => unitArray.push(ele.orgId));
            this._selectOrgDrawerTemp.setCheckincludeChild(unitArray, false);
            this.transpondify.sendUnits = [];
            this.transpondify.form.patchValue({ sendOrgInfos: this.transpondify.sendUnits });
        },
        // 撤选已选单位
        delSendObject: index => {
            let unitArray = [];
            const [closenode] = this.transpondify.sendUnits.splice(index, 1);
            unitArray.push(closenode.orgId);
            this.transpondify.form.patchValue({ sendOrgInfos: this.transpondify.sendUnits });
            this._selectOrgDrawerTemp.setCheckincludeChild(unitArray, false);
        },
        // 确认转发
        transpondNoticeData: () => {
            if (this.commonService.formVerify(this.transpondify.form)) {
                const data = this.transpondify.form.getRawValue();
                data.noticeId = this.URLParams.noticeId;
                this.service.transpondNotice(data).subscribe(result => {
                    if (result) {
                        this.message.success('转发成功。');
                        this.transpondify.form.reset();
                        this.transpondify.sendUnits = [];
                        this.transpondify.transpondUnits.push({
                            orgName: result.orgName,
                            orgId: result.orgId,
                        });
                        this.transpondify.close();
                    }
                });
            }
        },
    };

    /**
     * 路由参数
     */
    URLParams = {
        noticeId: null,
        noticeDeadline: false,
    };

    @ViewChild('onlineDocOverlayElement1', { static: false })
    onlineDocOverlayElement1: OnlineDocComponent;
    @ViewChild('onlineDocOverlayElement2', { static: false })
    onlineDocOverlayElement2: OnlineDocComponent;
    /**
     * 上传附件
     */
    fileUploadify = {
        // 文件上传
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file);
            this.commonService.fileUpload(formData).subscribe(result => {
                result.url = result.filePath = `${this.commonService.getOpenFileURL(
                    result.fileId,
                    result.fileName
                )}`;
                const fileObj = Object.assign(item.file, result);
                fileObj.operFiles = result;
                this.noticesIfy.fileList.push(fileObj);
                this.noticesIfy.fileList = [...this.noticesIfy.fileList];
            });
        },
        // 删除文件
        fileRemove: (file: NzUploadFile): boolean => {
            const _index = this.noticesIfy.fileList.findIndex(x => x.url === file.url);
            this.noticesIfy.fileList.splice(_index, 1);
            this.noticesIfy.fileList = [...this.noticesIfy.fileList];
            return true;
        },
    };

    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: NotificationService,
        private commonService: CommonService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.initRouterParams();
        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                text: '通知管理',
                type: 'event',
                event: () => this.router.navigate(['/client/notification']),
            },
            { type: 'text', text: '查看通知' },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 解析参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在 noticeId消息的id
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                if (this.URLParams.noticeId) {
                    this.loadNoticeData();
                    this.loadOpinionData();
                }
            }
        });
    }

    /**
     * 加载通知内容
     */
    loadNoticeData() {
        this.service.getReadNoticeData(this.URLParams.noticeId).subscribe(result => {
            // 判断请求数据是否成功返回
            if (result) {
                this.transpondify.loadingstatus = true;
            }
            this.noticeInfo.showType = result.type;
            // 删除状态
            delete result.type;
            this.noticeInfo = { ...this.noticeInfo, ...result };

            this.noticesIfy.form.patchValue({ endTime: result.endTime });
            this.URLParams.noticeDeadline = new Date(result.endTime) > new Date();
            this.noticeInfo.noticefileList = result.noticeAttachmentInfos.map(item => {
                return {
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
     * 获取发布信息中的反馈信息
     */
    loadOpinionData() {
        this.service.getOpinionData(this.URLParams.noticeId).subscribe(result => {
            if (result) {
                this.noticesIfy.isEdit = true;
                this.noticesIfy.form.patchValue(result);
                this.noticeInfo.type = result.type;
                this.noticesIfy.fileList = result.opinionAttachmentInfos.map(item => {
                    return <any>{
                        ...item,
                        thumbUrl: item.url,
                        name: item.fileName,
                        filename: item.fileName,
                        fileType: item.type,
                        fileId: item.url,
                    };
                });
            }
        });
    }

    /**
     * 保存反馈信息
     */
    saveOpinionData() {
        if (this.commonService.formVerify(this.noticesIfy.form)) {
            const attachments: OpinionAttachmentInfo[] = this.noticesIfy.fileList.map(
                (item: NzUploadFile) =>
                    <OpinionAttachmentInfo>{
                        fileName: item.name,
                        url: item.fileId,
                        size: item.size,
                        type: item.fileType,
                    }
            );

            const data: OpinionInfoVO = this.noticesIfy.form.getRawValue();
            data.opinionAttachmentInfos = attachments;
            if (this.noticesIfy.isEdit) {
                this.service.updateOpinionData(data).subscribe(result => {
                    if (result) {
                        this.message.success('反馈信息更新成功。');
                    }
                });
                return;
            }

            data.noticeId = this.URLParams.noticeId;
            this.service.saveOpinionData(data).subscribe(result => {
                if (result) {
                    this.noticesIfy.isEdit = true;
                    this.noticesIfy.form.patchValue({ opinionId: result.opinionId });
                    this.message.success('反馈成功。');
                }
            });
        }
    }

    /**
     * 转发
     */
    evtTranspond() {
        // 如果未获取转发单位则获取
        if (!this.transpondify.isGetTranspondUnits) {
            this.service.getTranspondList(this.URLParams.noticeId).subscribe(result => {
                this.transpondify.transpondUnits = result;
                this.transpondify.isGetTranspondUnits = true;
                this.transpondify.open();
            });
        } else {
            this.transpondify.open();
        }
    }
}
