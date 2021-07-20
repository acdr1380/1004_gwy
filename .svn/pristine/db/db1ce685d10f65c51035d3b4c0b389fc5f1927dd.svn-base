import { CommonService } from 'app/util/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TwoYearRiseService } from './two-year-rise.service';
import { Base64 } from 'js-base64';
import {
    WfWorkbenchWfStateEnum_CN,
    WfWorkbenchWfStateEnum,
} from 'app/workflow/enums/WfWorkbenchWfStateEnum';
import { JobStepStateEnum_CN, JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { JobMainStateEnum_CN } from 'app/workflow/enums/JobMainStateEnum';
import { ClientService } from 'app/master-page/client/client.service';

@Component({
    selector: 'app-two-year-rise',
    templateUrl: './two-year-rise.component.html',
    styleUrls: ['./two-year-rise.component.scss'],
})
export class TwoYearRiseComponent implements OnInit, OnDestroy {
    /**
     * 用户信息
     */
    userInfo: any = {};
    wfWorkbenchWfStateList = WfWorkbenchWfStateEnum_CN;
    /**
     * 部署相关
     */
    operDeployIfy = {
        year: null,
        yearList: [],
        dataList: [],
        dataAllList: [],

        _loadYearList: () => {
            this.service.selectAllYear().subscribe(result => {
                this.operDeployIfy.yearList = result;
                const [first] = result;
                this.operDeployIfy.year = first;

                this.operDeployIfy._loadDataList();
            });
        },
        _loadDataList: () => {
            this.service.selectAllBatch().subscribe(result => {
                this.operDeployIfy.dataAllList = result;
                this.operDeployIfy.loadYearDataList();
            });
        },
        loadYearDataList: () => {
            this.operDeployIfy.dataList = this.operDeployIfy.dataAllList.filter(
                v => v.year === this.operDeployIfy.year
            );

            // 一年只有一条的逻辑
            const [row] = this.operDeployIfy.dataList;
            this.service.selectAnalyseData(row.batchId).subscribe(result => {
                row.f = result.find(v => v.key === 2).count;
                row.n = result.find(v => v.key === 1).count;
                row.s = result.find(v => v.key === 0).count;
            });
        },

        evtEdit: row => {
            const GL = Base64.encode(JSON.stringify(row));
            this.router.navigate(['deploy', { GL }], { relativeTo: this.activatedRoute });
        },
    };

    jobStepState_CN = JobStepStateEnum_CN;
    jobMainState_CN = JobMainStateEnum_CN;
    operStatusList = [];
    /**
     * 业务权限
     */
    operResourceIfy = {
        list: [],
        /**
         * 跳转业务界面
         */
        _redirectOperPage: (wfId, params: any = {}) => {
            const url = `client/workflow/factory/${wfId}/${params.stepId || ''}`;
            params.redirect = this.router.url;
            // 是否已完成
            params.isFinished = false;
            if (!params.hasOwnProperty('jobStepState')) {
                params.jobStepState = JobStepStateEnum.PROCESSING;
            }
            // 如果是已完成，多加一个是否完成状态
            if (
                this.jobStateTabsIfy.list[this.jobStateTabsIfy.selectIndex].value ===
                WfWorkbenchWfStateEnum.DONE
            ) {
                params.isFinished = true;
            }
            const GL = Base64.encode(JSON.stringify(params));
            this.router.navigate([url], { queryParams: { GL } });
        },
    };
    /**
     * 业务列表
     */
    operTableIfy = {
        loading: false,
        data: [],
        pageIndex: 1,
        pageSize: 5,
        totalCount: 0,

        /**
         * 加载业务列表
         */
        evtPageChange: (reset: boolean = false) => {
            if (reset) {
                this.operTableIfy.pageIndex = 1;
            }

            // 表格只要重新取数，对选中行节点初始化
            // this.operTableIfy.selectRowIndex = -1;

            const data = {
                userId: this.userInfo.id,
                pageIndex: this.operTableIfy.pageIndex,
                pageSize: this.operTableIfy.pageSize,
                state: this.jobStateTabsIfy.list[this.jobStateTabsIfy.selectIndex].value,
                wfIds: ['salary_two_year_rise'],
            };
            this.operTableIfy.loading = true;
            this.service.getWfList(data).subscribe(result => {
                this.operTableIfy.loading = false;
                if (result.totalCount === 0) {
                    result.totalCount = this.operTableIfy.totalCount;
                }
                this.operTableIfy = Object.assign(this.operTableIfy, result);
            });
        },
        evtRedirectOperPage: row => {
            const params = {
                jobId: row.jobId,
                jobStepId: row.jobStepId,
                stepId: row.stepId,
                jobStepState: row.jobStepState,
                parentStepId: row.parentStepId,
                lastStepId: row.lastStepId,
            };

            this.operResourceIfy._redirectOperPage(row.wfId, params);
        },
        selectedData: null,
        /**
         * 流程跟踪
         */
        evtSeeStep: data => {
            this.operTableIfy.selectedData = data;
            this.operTailIfy.open();
        },
        evtStepOper: () => { },
    };

    /**
     * 业务搜索框
     */
    operSearchify = {
        width: 340,
        placeholder: '请输入关键字搜索',
        value: null,
        nzFilterOption: () => true,
        listOfOption: [],
        Parents: [],
        orgid: null,
        evtChange: event => { },
        evtSearch: event => { },
    };

    /**
     * 业务状态标签
     */
    jobStateTabsIfy = {
        list: WfWorkbenchWfStateEnum_CN,
        liststate: JobStepStateEnum_CN,
        selectIndex: 0,
        evtTabsChange: item => {
            this.operTableIfy.evtPageChange(true);
        },

        evtSteteToName: value => {
            // const item = this.jobStateTabsIfy.list.find(v => v.value === value + 1);
            const item = this.jobStateTabsIfy.liststate[value];
            return item.text;
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
            this.operTailIfy.visible = true;
            this.operTailIfy._loadOperTailList();
        },

        list: [],
        _loadOperTailList: () => {
            if (this.operTableIfy.selectedData.list) {
                this.operTailIfy.list = this.operTableIfy.selectedData.list;
                return;
            }
            this.service
                .selectListByWfTracking(this.operTableIfy.selectedData.jobId)
                .subscribe(result => {
                    this.operTableIfy.selectedData.list = result;
                    this.operTailIfy.list = result;
                });
        },
    };
    constructor(
        private clientService: ClientService,
        private service: TwoYearRiseService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService
    ) { }

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
        this.operDeployIfy._loadYearList();
        this.operTableIfy.evtPageChange();
        this.loadBreadcrumbNav();
    }

    /**
     * 加载面包屑导航
     */
    loadBreadcrumbNav() {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '机关工勤两年晋档业务',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 部署业务
     */
    evtDeploy() {
        this.router.navigate(['deploy'], { relativeTo: this.activatedRoute });
    }
}
