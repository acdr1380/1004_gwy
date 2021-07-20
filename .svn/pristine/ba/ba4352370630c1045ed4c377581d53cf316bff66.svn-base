import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ClientService } from 'app/master-page/client/client.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { OperRouterParams } from 'app/workflow/enums/OperRouterParams';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { SalaryInnerTransferService } from '../salary-inner-transfer.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzUploadXHRArgs, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';

import { NzMessageService } from 'ng-zorro-antd/message';

import { Base64 } from 'js-base64';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { LoadingService } from 'app/components/loading/loading.service';

@Component({
    selector: 'app-salary-inner-transfer-start',
    templateUrl: './salary-inner-transfer-start.component.html',
    styleUrls: ['./salary-inner-transfer-start.component.scss'],
})
export class SalaryInnerTransferStartComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
        private commonService: CommonService,
        private clientService: ClientService,
        private router: Router,
        private workflowService: WorkflowService,
        private service: SalaryInnerTransferService,
        private activatedRoute: ActivatedRoute,
        private modalService: NzModalService,
        private message: NzMessageService,
        private loading: LoadingService
    ) { }

    /**
     * 路由参数
     */
    URLParams: OperRouterParams;

    /**
     * 用户参数
     */
    userInfo: any;

    /**
     * 业务信息
     */
    wfInfo: any;

    /**
     * 业务信息
     */
    jobStepInfo: any;

    /**
     * 业务是否可用
     */
    // tslint:disable-next-line:no-inferrable-types
    isUsable: boolean = false;

    @ViewChild('operBaseInfoTemplate', { static: false }) operBaseInfoTemplate: ElementRef;
    @ViewChild('operPersonTemplate', { static: false }) operPersonTemplate: ElementRef;
    @ViewChild('operViewTemplate', { static: false }) operViewTemplate: ElementRef;

    /**
     * 办理步骤
     */
    transactionStepsIfy = {
        /**
         * 是否可用
         */
        isUsable: false,
        list: <any[]>[
            {
                name: '业务申报',
            },
            {
                name: '填写业务信息',
            },
            {
                name: '预览信息',
            },
        ],
        current: 0,

        evtStepChange: event => {
            if (!this.transactionStepsIfy.isUsable && event > 0) {
                return;
            }
            this.transactionStepsIfy.current = event;
            switch (event) {
                case 0:
                    this.transactionStepsIfy.list[event].template = this.operBaseInfoTemplate;
                    break;
                case 1:
                    this.transactionStepsIfy.list[event].template = this.operPersonTemplate;
                    // this.operBaseDirectionIfy.evtChange(0);
                    break;
                case 2:
                    this.transactionStepsIfy.list[event].template = this.operViewTemplate;
                    break;
            }
        },

        evtSelectAuditUnit: () => {
            this.setAuditUnitIfy.open();
        },

        evtLoadOperTail: () => {
            this.operTailIfy.open();
        },
    };

    @ViewChild('personInfoTemp', { static: false }) personInfoTemp: ElementRef;
    @ViewChild('personFileTemp', { static: false }) personFileTemp: ElementRef;
    /**
     * 填报方法，选人，上传资料，校验
     */
    // operBaseDirectionIfy = {
    //     list: <any>[
    //         {
    //             name: '填报信息',
    //         },
    //         {
    //             name: '上传个人附件材料',
    //         },
    //     ],
    //     current: 0,
    //     evtChange: event => {
    //         this.operBaseDirectionIfy.current = event;
    //         switch (event) {
    //             case 0:
    //                 this.operBaseDirectionIfy.list[event].template = this.personInfoTemp;
    //                 break;
    //             case 1:
    //                 this.operBaseDirectionIfy.list[event].template = this.personFileTemp;
    //                 // this.operPersonFileIfy._loadFileList();
    //                 break;
    //             default:
    //                 break;
    //         }
    //     },
    // };

    /**
     * 流程监控
     */
    operTailIfy = {
        title: '业务跟踪',
        width: 550,
        visible: false,
        close: () => (this.operTailIfy.visible = false),
        open: () => {
            this.operTailIfy._loadOperTailList();
            this.operTailIfy.visible = true;
        },

        list: [],
        _loadOperTailList: () => {
            if (this.operTailIfy.list.length > 0) {
                return;
            }
            this.workflowService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => {
                    this.operTailIfy.list = result;
                });
        },
    };

    confirmTitle = (control: FormControl): { [msg: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (!control.value.trim()) {
            return { empty: true, error: true };
        }
        return {};
    };

    @ViewChild('operSelectContactsElement', { static: false })
    operSelectContactsElement: OperSelectPersonComponent;

    @ViewChild('wfBaseParamsFileEle', { static: false })
    wfBaseParamsFileEle: OnlineDocComponent;
    /**
     * 业务基础信息
     */
    operBaseInfoIfy = {
        loading: false,
        form: new FormGroup({
            title: new FormControl(this.service.wfName, [this.confirmTitle]),
            contacts: new FormControl(null, [this.confirmTitle]),
            contactNumber: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.workflowService.reg.contactNumberReg),
            ]),
            id: new FormControl(null), // 更新时用的id
        }),
        /**
         * 文件上传
         */
        uploadIfy: {
            list: [],
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
                    this.operBaseInfoIfy.uploadIfy.list.push(fileObj);

                    this.operBaseInfoIfy.uploadIfy.list = [...this.operBaseInfoIfy.uploadIfy.list];
                });
            },

            /**
             * 删除文件
             */
            fileRemove: (file: NzUploadFile): boolean => {
                if (!this.isUsable) {
                    return;
                }
                const _index = this.operBaseInfoIfy.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.operBaseInfoIfy.uploadIfy.list.splice(_index, 1);
                this.operBaseInfoIfy.uploadIfy.list = [...this.operBaseInfoIfy.uploadIfy.list];
                return true;
            },
            selectedIndex: 0,
            preview: (file: NzUploadFile) => {
                const _index = this.operBaseInfoIfy.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.operBaseInfoIfy.uploadIfy.selectedIndex = _index;
                this.wfBaseParamsFileEle.show();
                return false;
            },
        },
        /**
         * 业务发起
         */
        evtOperStart: async (isEdit = false) => {
            if (!this.workflowService.formVerify(this.operBaseInfoIfy.form)) {
                return;
            }

            const formData = this.operBaseInfoIfy.form.getRawValue();
            const attachments = this.operBaseInfoIfy.uploadIfy.list.map(item => item.operFiles);

            const params: any = {
                wfId: this.service.wfId,
                wfParamMain: formData,
                attachments: attachments,
            };
            this.operBaseInfoIfy.loading = true;
            if (isEdit) {
                // 业务存在，更新业务数据
                params.jobId = this.URLParams.jobId;
                params.jobStepId = this.URLParams.jobStepId;
                this.workflowService.updateStepStandardInfo(params).subscribe(result => {
                    this.transactionStepsIfy.isUsable = true;
                    this.operBaseInfoIfy.loading = false;
                    this.transactionStepsIfy.evtStepChange(1);
                });
                return;
            }

            // 代管单位处理
            if (this.URLParams.agentOrgId && this.URLParams.agentOrgId !== '-1') {
                params.agentOrgId = this.URLParams.agentOrgId;
                params.agentOrgName = this.URLParams.agentOrgName;
            }

            const result = await this.workflowService.start(params).toPromise();
            this.operBaseInfoIfy.loading = false;
            if (result.code === 0) {
                this.transactionStepsIfy.isUsable = true;
                // this.jobStepInfo = result;

                // 构建路由参数，以免刷新后丢失刚发起的业务
                const routerParams = {
                    jobId: result.data.jobId,
                    jobStepId: result.data.jobStepId,
                    stepId: result.data.stepId,
                    jobStepState: JobStepStateEnum.PROCESSING,
                    redirect: this.URLParams.redirect,
                };
                this.URLParams = Object.assign(this.URLParams, routerParams);
                const GL = Base64.encode(JSON.stringify(routerParams));
                this.router.navigate([], {
                    relativeTo: this.activatedRoute,
                    queryParams: { GL },
                    queryParamsHandling: 'merge',
                });
                this.transactionStepsIfy.evtStepChange(1);
            }
        },

        /**
         * 撤销业务
         */
        evtCancelSubmit: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤销当前业务吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                    };
                    const _loading = this.loading.show();
                    this.workflowService.undo(this.service.wfId, data).subscribe(() => {
                        _loading.close();
                        this.router.navigateByUrl(this.URLParams.redirect);
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        /**
         * 选择已有联系人
         */
        evtSelectContacts: () => {
            this.operSelectContactsElement.show();
        },
        evtSelectChange: ({ contacts, contactNumber }) => {
            this.operBaseInfoIfy.form.patchValue({
                contacts,
                contactNumber,
            });
        },
    };

    /**
     * 选择审批单位抽屉
     */
    setAuditUnitIfy = {
        visible: false,
        title: '审批单位',
        width: 400,
        close: () => (this.setAuditUnitIfy.visible = false),
        open: () => {
            this.setAuditUnitIfy._loadAuditUnitList();
            this.setAuditUnitIfy.visible = true;
        },

        find: {
            searchWidth: 380,
            placeholder: '输入关键字查询',
            nzFilterOption: () => true,

            searchKey: null,
            list: [],

            evtModelChange: () => { },
            evtSearch: event => {
                if (event) {
                }
            },
            evtFocus: () => {
                this.setAuditUnitIfy.find.searchKey = null;
            },
        },

        list: <any[]>[],
        _loadAuditUnitList: () => {
            if (!this.wfInfo || !this.wfInfo.reportingGroup) {
                this.message.warning('未设置业务上报机构分组。');
                return;
            }
            const data = {
                ORG_GROUP_ID: this.wfInfo.reportingGroup,
                ORG_B01_ID: this.userInfo.unitId,
            };
            this.workflowService.selectListForReporting(data).subscribe(result => {
                this.setAuditUnitIfy.list = result;
            });
        },

        selectIndex: -1,
        evtSelectUnit: index => {
            this.setAuditUnitIfy.selectIndex = index;
        },

        subLoading: false,
        /**
         * 上报业务
         */
        evtSubmit: () => {
            const { ORG_B01_ID, ORG_NAME } = this.setAuditUnitIfy.list[
                this.setAuditUnitIfy.selectIndex
            ];
            const data = {
                jobId: this.URLParams.jobId,
                jobStepId: this.URLParams.jobStepId,
                targetUnitIds: [{ unitId: ORG_B01_ID, unitName: ORG_NAME }],
            };
            this.setAuditUnitIfy.subLoading = true;
            const _loading = this.loading.show();
            this.workflowService.submit(this.service.wfId, data).subscribe(result => {
                this.setAuditUnitIfy.subLoading = false;
                _loading.close();
                if (result) {
                    this.router.navigateByUrl(this.URLParams.redirect);
                }
            });
        },
    };

    ngOnInit() {
        const sessionUser = this.commonService.getUserLoginInfo();
        this.userInfo = sessionUser;
        this.loadJobMain();
    }

    ngAfterViewInit() {
        this.transactionStepsIfy.list[0].template = this.operBaseInfoTemplate;
        this.loadRouterParams();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载业务信息
     */
    loadJobMain() {
        this.workflowService.getWfMainData(this.service.wfId).subscribe(result => {
            this.wfInfo = result;
            if (!this.URLParams.jobId) {
                this.operBaseInfoIfy.form.patchValue({ title: result.wfName });
            }

            this.clientService.buildBreadCrumb([
                {
                    type: 'home',
                },
                {
                    type: 'event',
                    icon: 'share-alt',
                    text: `业务工作台`,
                    event: () => {
                        this.router.navigateByUrl(this.URLParams.redirect);
                    },
                },
                {
                    type: 'text',
                    text: `${result.wfName}-发起业务`,
                },
            ]);
        });
    }

    /**
     * 获得路由参数
     */
    private loadRouterParams() {
        // 获取路由参数
        this.activatedRoute.queryParamMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.isUsable = this.URLParams.jobStepState === JobStepStateEnum.PROCESSING;

                this.loadUserContacts();
                // 业务存在
                if (this.URLParams.jobId) {
                    this.loadSetReadonly();
                    this.loadStepStandardInfo();
                }
            }
        });
    }

    /**
     * 设置业务只读
     */
    private loadSetReadonly() {
        if (!this.isUsable) {
            this.operBaseInfoIfy.form.disable();
        } else {
            this.operBaseInfoIfy.form.enable();
        }
    }

    /**
     * 加载业务信息
     */
    private loadStepStandardInfo() {
        this.workflowService.getStepStandardInfo(this.URLParams).subscribe(result => {
            this.jobStepInfo = result;
            this.jobStepInfo.jobStepState = this.URLParams.jobStepState;
            this.jobStepInfo.parentStepId = this.URLParams.parentStepId;

            // 发起的新业务不需要设置业务基本信息，只有存在的业务才设置业务基本信息
            if (this.URLParams.jobId) {
                // 设置业务基本信息
                this.transactionStepsIfy.isUsable = true;
                this.operBaseInfoIfy.form.reset(this.jobStepInfo.wfParamMain);
                this.loadUserContacts();
                this.transactionStepsIfy.evtStepChange(this.transactionStepsIfy.current);
                if (!this.jobStepInfo.wfParamMain.contacts) {
                    this.transactionStepsIfy.isUsable = false;
                }
                if (this.jobStepInfo.attachments) {
                    // 设置业务附件
                    this.operBaseInfoIfy.uploadIfy.list = this.jobStepInfo.attachments.map(item => {
                        return {
                            ...item,
                            operFiles: item,
                            name: item.fileName,
                            url: `${this.commonService.getDownFileURL(item.fileId, item.fileName)}`,
                        };
                    });
                }
            }
        });
    }

    /**
     * 加载用户信息
     */
    private async loadUserContacts() {
        const { contacts, contactNumber } = this.operBaseInfoIfy.form.getRawValue();
        const userInfo: any = await this.commonService.getUserInfoByCache();
        if (!contacts) {
            this.operBaseInfoIfy.form.patchValue({ contacts: userInfo.SYSTEM_USER_NAME });
        }
        if (!contactNumber) {
            this.operBaseInfoIfy.form.patchValue({ contactNumber: userInfo.SYSTEM_USER_PHONE });
        }
    }
}
