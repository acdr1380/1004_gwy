import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { OperRouterParams } from 'app/workflow/enums/OperRouterParams';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { Base64 } from 'js-base64';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { LoadingService } from 'app/components/loading/loading.service';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TibetPersonEditService } from '../tibet-person-edit.service';

@Component({
    selector: 'gl-tibet-person-edit-manager',
    templateUrl: './tibet-person-edit-manager.component.html',
    styleUrls: ['./tibet-person-edit-manager.component.scss']
})
export class TibetPersonEditManagerComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * 路由参数
     */
    URLParams: OperRouterParams;
    /**
     * 业务信息
     */
    jobStepInfo: JobStepInfo;
    /**
     * 用户参数
     */
    userInfo: any;
    /**
     * 业务状态
     */
    operAuditState: number;
    /**
     * 业务是否可编辑
     */
    canEdit = false;

    /**
     * 业务信息
     */
    wfInfo: any;

    /**
     * 办理步骤
     */
    operBaseOptionIfy = {
        loading: false,
        /**
         * 业务退回
         */
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
        evtUndo: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤销吗？</b>`,
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
        /**
         * 业务归档
         */
        evtArchives: () => {
            const data = {
                jobId: this.URLParams.jobId,
                jobStepId: this.URLParams.jobStepId,
            };
            const _loading = this.loading.show();
            this.workflowService.submit(this.service.wfId, data).subscribe(result => {
                _loading.close();
                if (result) {
                    this.router.navigateByUrl(this.URLParams.redirect);
                }
            });
        },
        evtStop: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">该操作将废止该业务，是否确认废止？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const _loading = this.loading.show();
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        data: `终止业务:${+new Date()}`,
                    };
                    this.workflowService.stop(this.service.wfId, data).subscribe(() => {
                        _loading.close();
                        this.router.navigateByUrl(this.URLParams.redirect);
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

            this.workflowService.getOperStepList(this.service.wfId).subscribe(result => {
                this.operStepFlowIfy.list = result;
            });
        },
    };

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

            evtModelChange: event => { },
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

        /**
         * 上报业务
         */
        evtSubmit: () => {
            const { ORG_B01_ID, ORG_NAME } =
                this.setAuditUnitIfy.list[this.setAuditUnitIfy.selectIndex];
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

    constructor(
        private clientService: ClientService,
        private service: TibetPersonEditService,
        private router: Router,
        private workflowService: WorkflowService,
        private activatedRoute: ActivatedRoute,
        private message: NzMessageService,
        private commonService: CommonService,
        private modalService: NzModalService,
        private cdr: ChangeDetectorRef,
        private loading: LoadingService
    ) { }

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
    }

    ngAfterViewInit() {
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
                { type: 'text', text: `${result.wfName}-业务审批` },
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
                this.canEdit = this.URLParams.jobStepState === JobStepStateEnum.PROCESSING;

                this.loadJobMain();
                // 业务存在
                if (this.URLParams.jobId) {
                    this.loadStepStandardInfo();
                }
            }
            this.cdr.detectChanges();
        });
    }

    /**
     * 加载业务信息
     */
    private loadStepStandardInfo() {
        this.workflowService.getStepStandardInfo(this.URLParams).subscribe(result => {
            this.jobStepInfo = result;
            this.loadOperAuditState();
        });
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
}
