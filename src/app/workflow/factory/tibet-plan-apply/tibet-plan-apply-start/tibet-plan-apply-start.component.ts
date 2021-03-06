import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TibetPlanApplyService } from '../tibet-plan-apply.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { OperRouterParams } from 'app/workflow/enums/OperRouterParams';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { Base64 } from 'js-base64';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';

import { LoadingService } from 'app/components/loading/loading.service';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ChangeDetectorRef } from '@angular/core';
import { from } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';

@Component({
    selector: 'gl-tibet-plan-apply-start',
    templateUrl: './tibet-plan-apply-start.component.html',
    styleUrls: ['./tibet-plan-apply-start.component.scss'],
})
export class TibetPlanApplyStartComponent implements OnInit {
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
    jobStepInfo: JobStepInfo;
    /**
     * 业务是否可编辑
     */
    canEdit = false;
    /**
     * 业务信息
     */
    wfInfo: any;

    /**
     * 业务状态
     */
    operAuditState: number;

    @ViewChild('startContent', { static: true }) _startContent: ElementRef;
    @ViewChild('editContent', { static: true }) _editContent: ElementRef;
    @ViewChild('preViewTemp', { static: true }) _preViewTemp: ElementRef;
    /**
     * 外层步骤
     */
    operBaseOptionIfy = {
        /**
         * 是否可用
         */
        isUsable: false,
        // personNubmer: 0,
        list: <any>[{ name: '填报业务信息' }, { name: '填报人员信息' }, { name: '预览信息' }],
        current: 0,
        evtStepChange: index => {
            if (!this.operBaseOptionIfy.isUsable) {
                return;
            }
            this.operBaseOptionIfy.current = index;
            switch (index) {
                case 0:
                    this.operBaseOptionIfy.list[index].template = this._startContent;
                    this.operBaseOptionIfy.list[index].form = this.wfBaseParams.form;
                    break;
                case 1:
                    this.operBaseOptionIfy.list[index].template = this._editContent;
                    break;
                case 2:
                    this.loadOperAuditState();
                    this.operBaseOptionIfy.list[index].template = this._preViewTemp;
                    break;
            }
        },
        evtSendBack: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要退回当前业务吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                    };
                    const _loading = this.loading.show();
                    this.workflowService.submit(this.service.wfId, data).subscribe(result => {
                        if (result) {
                            _loading.close();
                            this.router.navigateByUrl(this.URLParams.redirect);
                        }
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    @ViewChild('operSelectContactsElement', { static: false })
    operSelectContactsElement: OperSelectPersonComponent;

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 业务人员基本信息，业务附件相关
     */
    wfBaseParams = {
        evtSelectContacts: () => {
            this.operSelectContactsElement.show();
        },
        evtSelectChange: ({ contacts, contactNumber }) => {
            this.wfBaseParams.form.patchValue({
                contacts,
                contactNumber,
            });
        },
        form: new FormGroup({
            title: new FormControl(this.service.wfName, [
                Validators.required,
                Validators.maxLength(100),
                Validators.pattern(/[\S]{1,100}/),
            ]),
            contacts: new FormControl(null, [
                Validators.required,
                Validators.maxLength(30),
                Validators.pattern(/[\S]{1,30}/),
            ]),
            contactNumber: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.workflowService.reg.contactNumberReg),
            ]),
            id: new FormControl(null), // 更新时用的id
        }),
        selectedIndex: 0,
        /**
         * 附件列表
         */
        wfFileList: [],
        /**
         * 上传附件
         */
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
                this.wfBaseParams.wfFileList.push(fileObj);
                this.wfBaseParams.wfFileList = [...this.wfBaseParams.wfFileList];
            });
        },
        /**
         * 删除文件
         */
        fileRemove: file => {
            const _index = this.wfBaseParams.wfFileList.findIndex(x => x.fileId === file.fileId);
            if (_index > -1) {
                this.wfBaseParams.wfFileList.splice(_index, 1);
            }
            this.wfBaseParams.wfFileList = [...this.wfBaseParams.wfFileList];
            return true;
        },
        preview: file => {
            const _index = this.wfBaseParams.wfFileList.findIndex(x => x.fileId === file.fileId);
            this.wfBaseParams.selectedIndex = _index;
            this.onlineDocOverlayElement.show();
            return false;
        },
        loading: false,
        /**
         * 撤销业务
         */
        cancelOper: () => {
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
    };

    /**
     * 业务流程图
     */
    operStepFlowIfy = {
        visible: false,
        title: '业务路线图',
        height: 220,
        close: () => (this.operStepFlowIfy.visible = false),
        open: () => {
            this.operStepFlowIfy._loadOperStepList();
            this.operStepFlowIfy.visible = true;
        },

        list: [],
        /**
         * 获得当前步骤
         */
        evtGetStepIndex: (): number => {
            if (this.jobStepInfo && this.operStepFlowIfy.list.length > 0) {
                const index = this.operStepFlowIfy.list.findIndex(
                    item => item.stepId === this.jobStepInfo.stepId
                );
                return index;
            }
            return 0;
        },
        _loadOperStepList: () => {
            if (this.operStepFlowIfy.list.length > 0) {
                return;
            }

            this.workflowService.getOperStepList(this.jobStepInfo.wfId).subscribe(result => {
                this.operStepFlowIfy.list = result;
            });
        },
    };

    /**
     * 流程监控
     */
    operTailIfy = {
        title: '业务跟踪',
        width: 480,
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

            evtModelChange: () => {},
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
        // 归档业务
        evtArchives: () => {
            const data = {
                jobId: this.URLParams.jobId,
                jobStepId: this.URLParams.jobStepId,
            };
            this.workflowService.submit(this.service.wfId, data).subscribe(result => {
                this.router.navigateByUrl(this.URLParams.redirect);
            });
        },
    };

    /** 发起业务选择计划 */
    setPlanIfy = {
        visible: false,
        width: 300,
        title: '选择计划',
        plan: null,
        open: () => {
            this.setPlanIfy.visible = true;
        },
        close: () => {
            this.setPlanIfy.visible = false;
        },
        // 计划列表
        planList: [],

        // 计划表单
        form: new FormGroup({
            PLAN01: new FormControl(null, Validators.required),
            PLAN02: new FormControl(null, Validators.required),
            PLAN05: new FormControl(0, Validators.required),
        }),
    };

    /**
     * 审核业务
     */
    auditPersonIfy = {
        visible: false,
        title: '业务审批',
        width: 400,
        close: () => (this.auditPersonIfy.visible = false),
        open: () => {
            this.auditPersonIfy._initAuditState();
            this.auditPersonIfy.visible = true;
        },

        isBatch: false,
        form: new FormGroup({
            auditState: new FormControl(null, Validators.required),
            auditStateDesc: new FormControl(null, Validators.required),
        }),
        _initAuditState: () => {
            this.auditPersonIfy.form
                .get('auditState')
                .valueChanges.pipe(
                    filter(value => value > -1),
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const verifyFields = ['auditStateDesc'];
                    verifyFields.forEach(field => {
                        const control: AbstractControl = this.auditPersonIfy.form.get(field);
                        if (value === 0) {
                            control.setValidators(Validators.required);
                        } else {
                            control.setValue(null);
                            control.clearValidators();
                        }
                    });
                });
        },

        evtSaveAudit: () => {
            if (this.workflowService.formVerify(this.auditPersonIfy.form)) {
                const data = {
                    ...this.auditPersonIfy.form.getRawValue(),
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobParamId: this.jobStepInfo.jobParamId,
                    keyValue: this.jobStepInfo.jobDataId,
                    auditType: WfParamDataAuditTypeEnum.Workflow,
                };

                this.workflowService.saveAudit(data).subscribe(result => {
                    // 设置审批结果
                    // this.selectAuditList();
                    this.operAuditState = result.auditState;
                    this.auditPersonIfy.close();
                    this.loadOperAuditState();
                });
            }
        },
    };

    constructor(
        private clientService: ClientService,
        private service: TibetPlanApplyService,
        private router: Router,
        private workflowService: WorkflowService,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private message: NzMessageService,
        private modalService: NzModalService,

        private loading: LoadingService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
    }

    ngAfterViewInit() {
        this.operBaseOptionIfy.list[0].template = this._startContent;
        this.operBaseOptionIfy.list[0].form = this.wfBaseParams.form;

        // 添加监控事件
        const func = () => {
            const param = {
                PLAN02: this.setPlanIfy.form.get('PLAN02').value?.getFullYear(),
                PLAN05: this.setPlanIfy.form.get('PLAN05').value,
            };
            this.service.getPlanList(param).subscribe(res => {
                this.setPlanIfy.planList = res.map(x => ({
                    label: x.PLAN01,
                    value: { planId: x.DATA_3001_OTHER_PLAN_ID, planName: x.PLAN01 },
                }));
            });
        };
        this.setPlanIfy.form.get('PLAN01').valueChanges.subscribe(x => {
            this.setPlanIfy.plan = x;
        });
        this.setPlanIfy.form.get('PLAN02').valueChanges.subscribe(func);
        this.setPlanIfy.form.get('PLAN05').valueChanges.subscribe(func);

        this.loadRouteParams();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    private loadRouteParams() {
        // 获取路由参数
        this.activatedRoute.queryParamMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                // 业务是否可编辑
                this.canEdit = this.URLParams.jobStepState === JobStepStateEnum.PROCESSING;

                this.loadJobMain();

                this.loadUserContacts();
                // 业务存在
                if (this.URLParams.jobId) {
                    this.loadStepStandardInfo();
                    this.loadSetReadonly();
                }
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * 加载业务信息
     */
    loadJobMain() {
        this.workflowService.getWfMainData(this.service.wfId).subscribe(result => {
            this.wfInfo = result;
            if (!this.URLParams.jobId) {
                this.wfBaseParams.form.patchValue({ title: result.wfName });
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

    /** 设置业务只读 */
    private loadSetReadonly() {
        if (!this.canEdit) {
            this.wfBaseParams.form.disable();
        } else {
            this.wfBaseParams.form.enable();
        }
    }

    /**
     * 获得业务全局状态
     */
    loadOperAuditState() {
        this.workflowService
            .getOperAuditState(this.service.wfId, this.URLParams.jobId, this.URLParams.jobStepId)
            .subscribe(result => {
                this.operAuditState = result;
            });
    }

    //#region 业务操作相关
    /**
     * 业务发起
     */
    evtSubmitStart(isEdit = false) {
        if (!this.workflowService.formVerify(this.wfBaseParams.form)) {
            return;
        }
        if (
            this.jobStepInfo?.stepId === 'start' &&
            !this.workflowService.formVerify(this.setPlanIfy.form) && this.operBaseOptionIfy.isUsable
        ) {
            return;
        }
        this.setPlanIfy.close();
        const formData = this.wfBaseParams.form.getRawValue();
        const attachments = this.wfBaseParams.wfFileList.map(item => item.operFiles);
        const params: any = {
            wfId: this.service.wfId,
            wfParamMain: formData,
            attachments: attachments,
            startData: this.setPlanIfy.plan,
        };
        this.wfBaseParams.loading = true;
        if (isEdit) {
            // 业务存在，更新业务数据
            params.jobId = this.URLParams.jobId;
            params.jobStepId = this.URLParams.jobStepId;
            this.workflowService.updateStepStandardInfo(params).subscribe(() => {
                this.operBaseOptionIfy.isUsable = true;
                this.wfBaseParams.loading = false;
                this.operBaseOptionIfy.evtStepChange(1);
            });
            return;
        }

        // 代管单位处理
        if (this.URLParams.agentOrgId && this.URLParams.agentOrgId !== '-1') {
            params.agentOrgId = this.URLParams.agentOrgId;
            params.agentOrgName = this.URLParams.agentOrgName;
        }
        this.workflowService.start(params).subscribe(result => {
            this.wfBaseParams.loading = false;
            if (result.code === 0) {
                this.operBaseOptionIfy.isUsable = true;
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
                this.operBaseOptionIfy.evtStepChange(1);
            }
        });
    }

    /**
     * 加载业务信息
     */
    private loadStepStandardInfo() {
        this.workflowService.getStepStandardInfo(this.URLParams).subscribe(result => {
            this.jobStepInfo = result;
            // 发起的新业务不需要设置业务基本信息，只有存在的业务才设置业务基本信息
            if (this.URLParams.jobId) {
                // 设置业务基本信息
                this.wfBaseParams.form.reset(this.jobStepInfo.wfParamMain);
                this.loadUserContacts();
                if (this.jobStepInfo.wfParamMain.contacts) {
                    this.operBaseOptionIfy.isUsable = true;
                }
                if (this.jobStepInfo.attachments) {
                    // 设置业务附件
                    this.wfBaseParams.wfFileList = this.jobStepInfo.attachments.map(item => {
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
        const { contacts, contactNumber } = this.wfBaseParams.form.getRawValue();
        const userInfo: any = await this.commonService.getUserInfoByCache();
        if (!contacts) {
            this.wfBaseParams.form.patchValue({ contacts: userInfo.SYSTEM_USER_NAME });
        }
        if (!contactNumber) {
            this.wfBaseParams.form.patchValue({ contactNumber: userInfo.SYSTEM_USER_PHONE });
        }
    }
    //#endregion
}
