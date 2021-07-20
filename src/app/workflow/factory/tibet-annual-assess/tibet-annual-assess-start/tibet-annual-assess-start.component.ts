import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { OperRouterParams } from 'app/workflow/enums/OperRouterParams';
import { WorkflowService } from 'app/workflow/workflow.service';
import { Base64 } from 'js-base64';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientService } from 'app/master-page/client/client.service';
import { TibetAnnualAssessService } from '../tibet-annual-assess.service';


@Component({
    selector: 'gl-tibet-annual-assess-start',
    templateUrl: './tibet-annual-assess-start.component.html',
    styleUrls: ['./tibet-annual-assess-start.component.scss']
})
export class TibetAnnualAssessStartComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(
        private commonService: CommonService,
        private clientService: ClientService,
        private router: Router,
        private workflowService: WorkflowService,
        private service: TibetAnnualAssessService,
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
    jobStepInfo: JobStepInfo;

    /**
     * 业务是否可用
     */
    // tslint:disable-next-line:no-inferrable-types
    isUsable: boolean = false;

    /**
     * 代管单位
     */
    agentOrg = {
        agentOrgId: null,
        agentOrgName: null,
    };

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
        list: <any>[{ name: '填报业务信息' }, { name: '填报人员信息' }, { name: '预览信息' }],
        current: 0,

        evtStepChange: event => {
            if (!this.transactionStepsIfy.isUsable) {
                return;
            }
            this.transactionStepsIfy.current = event;
            switch (event) {
                case 0:
                    this.transactionStepsIfy.list[event].template = this.operBaseInfoTemplate;
                    break;
                case 1:
                    this.transactionStepsIfy.list[event].template = this.operPersonTemplate;
                    break;
                case 2:
                    // this.jobStepInfo = { ...this.jobStepInfo };
                    this.transactionStepsIfy.list[event].template = this.operViewTemplate;
                    break;
            }
        },

        evtSelectAuditUnit: () => {
            this.setAuditUnitIfy.open();
        },
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    @ViewChild('operSelectContactsElement', { static: false })
    operSelectContactsElement: OperSelectPersonComponent;
    /**
     * 业务基础信息
     */
    operBaseInfoIfy = {
        loading: false,
        form: new FormGroup({
            title: new FormControl(this.service.wfName, Validators.required),
            contacts: new FormControl(null, Validators.required),
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
            fileRemove: file => {
                const _index = this.operBaseInfoIfy.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                if (_index > -1) {
                    this.operBaseInfoIfy.uploadIfy.list.splice(_index, 1);
                }
                this.operBaseInfoIfy.uploadIfy.list = [...this.operBaseInfoIfy.uploadIfy.list];
                return true;
            },
            selectedIndex: 0,
            preview: file => {
                const _index = this.operBaseInfoIfy.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.operBaseInfoIfy.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
        },
        /**
         * 业务发起
         */
        evtOperStart: (isEdit = false) => {
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
                this.workflowService.updateStepStandardInfo(params).subscribe(() => {
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

            this.workflowService.start(params).subscribe(result => {
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
            });
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
                    this.workflowService.undo(this.service.wfId, data).subscribe(result => {
                        _loading.close();
                        if (result === 0) {
                            this.router.navigateByUrl(this.URLParams.redirect);
                        }
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
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
            const _loading = this.loading.show();
            this.workflowService.submit(this.service.wfId, data).subscribe(result => {
                _loading.close();
                if (result) {
                    this.router.navigateByUrl(this.URLParams.redirect);
                }
            });
        },
    };

    ngOnInit() {
        this.loadJobMain();
        this.loadUserContacts();
        this.userInfo = this.commonService.getUserLoginInfo();
    }

    ngAfterViewInit() {
        this.transactionStepsIfy.list[0].template = this.operBaseInfoTemplate;
        this.loadRouterParams();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 设置业务只读
     */
    private loadSetReadonly() {
        if (!this.isUsable) {
            this.operBaseInfoIfy.form.disable();
        }
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
                // 业务存在
                if (this.URLParams.jobId) {
                    this.loadSetReadonly();
                    this.loadStepStandardInfo();
                }
            }
        });
    }

    /**
     * 加载业务信息
     */
    private loadStepStandardInfo() {
        this.workflowService.getStepStandardInfo(this.URLParams).subscribe(result => {
            this.jobStepInfo = result;
            if (result.agentOrgId !== -1) {
                // 保存代管单位
                this.agentOrg.agentOrgId = result.agentOrgId;
                this.agentOrg.agentOrgName = result.agentOrgName;
            }
            // 发起的新业务不需要设置业务基本信息，只有存在的业务才设置业务基本信息
            if (this.URLParams.jobId) {
                if (this.jobStepInfo.wfParamMain.contacts) {
                    this.transactionStepsIfy.isUsable = true;
                }

                // 设置业务基本信息
                this.operBaseInfoIfy.form.reset(this.jobStepInfo.wfParamMain);
                this.loadUserContacts();
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
        // const { userInfo } = this.commonService.getUserLoginInfo().sessionUser;
        const userInfo: any = await this.commonService.getUserInfoByCache();
        if (!contacts) {
            this.operBaseInfoIfy.form.patchValue({ contacts: userInfo.SYSTEM_USER_NAME });
        }
        if (!contactNumber) {
            this.operBaseInfoIfy.form.patchValue({ contactNumber: userInfo.SYSTEM_USER_PHONE });
        }
    }
}
