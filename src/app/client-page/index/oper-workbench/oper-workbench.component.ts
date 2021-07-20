import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { R } from 'app/entity/vo/R';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { JobMainStateEnum_CN } from 'app/workflow/enums/JobMainStateEnum';
import { JobStepStateEnum, JobStepStateEnum_CN } from 'app/workflow/enums/JobStepStateEnum';
import { WfWorkbenchWfStateEnum } from 'app/workflow/enums/WfWorkbenchWfStateEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { Base64 } from 'js-base64';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IndexService } from '../index.service';

@Component({
    selector: 'gl-oper-workbench',
    templateUrl: './oper-workbench.component.html',
    styleUrls: ['./oper-workbench.component.scss'],
})
export class OperWorkbenchComponent implements OnInit {
    /**
     * 用户信息
     */
    userInfo: any = {};

    operTable = {
        data: [],
        page: 0,
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
    };
    jobMainStateList = JobMainStateEnum_CN;
    jobStepStateList = JobStepStateEnum_CN;

    /**
     * 工作台状态切换标签
     */
    operStatusTabsIfy = {
        list: [],
        selectedIndex: 0,
        selectChange: event => {
            this.loadOperTable(true);
        },
        closeTab: index => {
            this.operSearchify.value = null;
            this.operStatusTabsIfy.list.splice(index, 1);
            this.loadOperTable(true);
        },
    };

    /**
     * 搜索订阅者
     */
    private searchKey$ = new Subject<string>();
    /**
     * 业务搜索框
     */
    operSearchify = {
        width: 340,
        placeholder: '请输入业务标题关键字搜索',
        value: null,
        evtSearch: () => {
            if (this.operSearchify.value) {
                this.searchKey$.next(this.operSearchify.value);
            }
        },
        keydown: event => {
            if (event.keyCode === 13) {
                this.operSearchify.evtSearch();
            }
        },
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;

    /**
     * 业务附件
     */
    operAnnexIfy = {
        visible: false,
        title: '业务附件',
        width: 400,
        close: () => (this.operAnnexIfy.visible = false),
        open: row => {
            this.operAnnexIfy.selectedOper = row;
            this.operAnnexIfy._loadFileList();
            this.operAnnexIfy.visible = true;
        },
        selectedOper: null,
        _loadFileList: () => {
            const { jobId, jobStepId } = this.operAnnexIfy.selectedOper;
            this.service.getOperAttachment(jobId, jobStepId).subscribe(result => {
                this.operAnnexIfy.fileList = result.map(file => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    return {
                        ...file,
                        thumbUrl,
                        operFiles: file,
                        fileName: file.fileName,
                        url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                        name: file.fileName,
                    };
                });
            });
        },

        selectedIndex: 0,
        fileList: [],
        preview: file => {
            const index = this.operAnnexIfy.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
        },
    };

    /**
     * 业务跟踪
     */
    tailAfterOper = {
        title: '业务跟踪',
        width: 650,
        visible: false,
        close: () => (this.tailAfterOper.visible = false),
        open: () => (this.tailAfterOper.visible = true),
    };

    /*
     * 审批历史
     */
    tailAfterList$: Array<any>;

    /**
     * 业务流程图参数
     */
    workFlowChartParam = {
        operStepList: [],
        currentStep: 0,
        visible: false,
    };

    constructor(
        private clientService: ClientService,
        private service: IndexService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private msgService: NzMessageService,
        private commonService: CommonService,
        private workflowService: WorkflowService,
        private loading: LoadingService
    ) {}

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();

        // 业务搜索
        this.searchKey$.pipe(debounceTime(300)).subscribe(keyword => {
            let index = this.operStatusTabsIfy.list.findIndex(v => v.keyword === keyword);
            if (index === -1) {
                this.operStatusTabsIfy.list.push({
                    text: `搜索：${keyword}`,
                    tag: 'search',
                    keyword,
                });
                index = this.operStatusTabsIfy.list.length;
            }
            this.operStatusTabsIfy.selectedIndex = index;
        });

        this.loadOperStatusList();
        this.initBreadcrumb();
    }

    initBreadcrumb() {
        // 面包屑导航
        this.clientService.buildBreadCrumb([
            {
                icon: 'home',
                link: '/client/index',
                type: 'home',
            },
            {
                text: '事务提醒',
                link: '/client/index',
                type: 'event',
                event: () => {
                    this.router.navigate(['/client/index']);
                },
            },
            {
                text: '业务列表',
                type: 'text',
            },
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
            // 判断路由参数是否存在
            if (params.has('key')) {
                const _index = this.operStatusTabsIfy.list.findIndex(
                    v => v.key === params.get('key')
                );
                this.operStatusTabsIfy.selectedIndex = _index;

                this.loadOperTable();
            }
        });
    }

    async loadOperStatusList() {
        this.operStatusTabsIfy.list = await this.service.getWfListInfo().toPromise();
        this.initRouterParams();
    }

    loadOperTable(reset: boolean = false): void {
        if (reset) {
            this.operTable.pageIndex = 1;
        }
        if (this.operStatusTabsIfy.selectedIndex > 3) {
            const item = this.operStatusTabsIfy.list[this.operStatusTabsIfy.selectedIndex];
            const data = {
                pageIndex: this.operTable.pageIndex,
                pageSize: this.operTable.pageSize,
                queryStr: item.keyword,
            };
            this.service.getQueryByWfList(data).subscribe(result => {
                if (result.totalCount > 0) {
                    this.operTable.totalCount = result.totalCount;
                }
                this.operTable.data = result.data;
            });
            return;
        }
        const status = this.operStatusTabsIfy.list[this.operStatusTabsIfy.selectedIndex].value;
        this.service.getWfList(status, this.operTable).subscribe(result => {
            if (result.totalCount > 0) {
                this.operTable.totalCount = result.totalCount;
            }
            this.operTable.data = result.data;
        });
    }

    /**
     * 业务代办到草稿
     * @param row 业务
     */
    async operProcess(row) {
        let job = row;
        if (row.jobStepState === JobStepStateEnum.PENDING) {
            const _loading = this.loading.show();

            job = await this.workflowService
                .process(row.wfId, {
                    jobId: row.jobId,
                    jobStepId: row.jobStepId,
                })
                .toPromise();
            _loading.close();
        }

        const url = `client/workflow/factory/${job.wfId}/${job.stepId || ''}`;
        const params = <any>{
            ...job,
            redirect: this.router.url,
        };
        if (!params.hasOwnProperty('jobStepState')) {
            params.jobStepState = JobStepStateEnum.PROCESSING;
        }
        // 如果是已完成，多加一个是否完成状态
        if (
            this.operStatusTabsIfy.list[this.operStatusTabsIfy.selectedIndex].value ===
            WfWorkbenchWfStateEnum.DONE
        ) {
            params.isFinished = true;
        }
        const GL = Base64.encode(JSON.stringify(params));
        this.router.navigate([url], { queryParams: { GL } });
    }
    /**
     * 业务跟踪
     *
     * @param {*} data
     * @memberof WorkbenchComponent
     */
    jobFollowing(data) {
        this.tailAfterOper.open();
        // 流程跟踪
        this.service
            .selectListByWfTracking(data['jobId'])
            .then(result => (this.tailAfterList$ = result));
    }
    /**
     * 流程图
     *
     * @param {*} data
     */
    workFlowChart(data) {
        this.workFlowChartParam.visible = true;
        this.service.getOperStepList(data['wfId']).then((json: R) => {
            if (json.code === 0) {
                this.workFlowChartParam.operStepList = json.data;
                if (json.data && json.data.length > 0) {
                    this.workFlowChartParam.currentStep = this.workFlowChartParam.operStepList.findIndex(
                        item => {
                            return item.stepId === data['lastStepId'];
                        }
                    );
                }
            } else {
                this.msgService.warning(json.msg);
            }
        });
    }

    drawerClose() {
        this.tailAfterOper.visible = this.workFlowChartParam.visible = false;
    }
}
