import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { TibetPlanApplyService } from '../tibet-plan-apply.service';
import { LoadingService } from 'app/components/loading/loading.service';

@Component({
    selector: 'gl-tibet-plan-apply-form',
    templateUrl: './tibet-plan-apply-form.component.html',
    styleUrls: ['./tibet-plan-apply-form.component.scss'],
})
export class TibetPlanApplyFormComponent implements OnInit {
    /** 业务信息 */
    private _jobStepInfo: JobStepInfo;
    @Input() set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
            this.planPostIfy.loadPlanInfo();
            this.positionListIfy.loadList();
            this.loadOnly();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /** 是否能编辑 */
    private _canEdit: boolean = false;
    @Input() set canEdit(v) {
        this._canEdit = v;
        this.loadOnly();
    }
    get canEdit() {
        return this._canEdit;
    }

    loadOnly() {
        this.canEdit && this.jobStepInfo?.stepId === 'start'
            ? this.positionInfoIfy.form.enable()
            : this.positionInfoIfy.form.disable();
    }

    /** 登录账号信息 */
    userInfo = this.commonService.getUserLoginInfo();

    /** 子集表名 */
    tableId = this.tableHelper.getTableCode('BP01');

    /** 计划信息 */
    planPostIfy = {
        /** 计划名称 */
        planName: null,

        planId: null,
        // 获取计划信息
        loadPlanInfo: () => {
            this.service.getPlanInfo(this.jobStepInfo.jobId).subscribe(res => {
                this.planPostIfy.planId = res.planId;
                this.planPostIfy.planName = res.planName;
            });
        },
    };

    /** 添加职位抽屉 */
    addPositionDra = {
        visible: false,
        width: 300,
        title: '添加职位',
        zh_CN: {},
        open: () => {
            this.addPositionDra.visible = true;
        },
        close: () => {
            this.addPositionDra.form.reset();
            this.addPositionDra.zh_CN = {};
            this.addPositionDra.visible = false;
        },
        form: new FormGroup({
            BP0106: new FormControl(null, Validators.required),
            BP0103: new FormControl(null, Validators.required),
            BP0107: new FormControl(null, Validators.required),
            BP0109: new FormControl(null, Validators.required),
            BP0108: new FormControl(null),
        }),
        // 保存方法
        savePosition: () => {
            if (!this.commonService.formVerify(this.addPositionDra.form)) {
                return;
            }
            const param = {
                keyId: this.userInfo.unitId,
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                changeType: WfDataChangeTypeEnum.ADD,
                tableId: this.tableHelper.getTableCode('BP01'),
                data: {
                    ...this.addPositionDra.form.getRawValue(),
                    BP0101: this.planPostIfy.planId,
                    BP0102: this.planPostIfy.planName,
                },
            };
            this.workFlowService.saveChangeData(param).subscribe(res => {
                const data = { ...res.data };
                data[this.tableId + '_ID'] = res.childId;
                this.positionListIfy.list = [...this.positionListIfy.list, data];
                this.positionListIfy.indexChange(this.positionListIfy.index);
                this.addPositionDra.close();
            });
        },
    };

    @ViewChild('scrollView')
    private scrollViewEl: CdkVirtualScrollViewport;
    /** 职位列表 */
    positionListIfy = {
        list: [],
        index: 0,
        current: null,
        indexChange: index => {
            this.positionListIfy.index = index;
            this.positionListIfy.current = this.positionListIfy.list[index];

            this.positionInfoIfy.zh_CN = this.positionListIfy.current;
            this.positionInfoIfy.form.reset(this.positionListIfy.current);
        },
        loadList: () => {
            const param = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                childFields: {},
            };
            param.childFields[this.tableId] = [];
            const _loading = this.loading.show();
            this.workFlowService.getPsnList(this.service.wfId, param).subscribe(res => {
                _loading.close();
                this.positionListIfy.list = res[this.tableId] || [];
                if (this.positionListIfy.list.length > 0) {
                    this.positionListIfy.indexChange(0);
                }
            });
        },
        // 撤选
        deletePosition: item => {
            const param = [
                {
                    childId: item[this.tableId + '_ID'],
                    keyId: this.userInfo.unitId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.DELETE,
                    tableId: this.tableId,
                },
            ];
            this.workFlowService.deleteTableData(param).subscribe(() => {
                const index = this.positionListIfy.list.findIndex(
                    v => v[this.tableId + '_ID'] === item[this.tableId + '_ID']
                );
                this.positionListIfy.list.splice(index, 1);
                this.positionListIfy.list = [...this.positionListIfy.list];
                // 如果职位列表删除完
                if (this.positionListIfy.list.length === 0) {
                    this.positionListIfy.index = 0;
                    return;
                }
                // 职位列表还存在数据
                if (this.positionListIfy.list.length - 1 > this.positionListIfy.index) {
                    this.positionListIfy.indexChange(this.positionListIfy.index);
                } else {
                    this.positionListIfy.indexChange(this.positionListIfy.list.length - 1);
                }
            });
        },
    };

    /** 职位信息 */
    positionInfoIfy = {
        zh_CN: {},
        form: new FormGroup({
            BP0105: new FormControl(null, Validators.required),
            BP0106: new FormControl(null, Validators.required),
            BP0107: new FormControl(null, Validators.required),
            BP0108: new FormControl(null),
            BP0109: new FormControl(null, Validators.required),

            BP0110: new FormControl(null, Validators.required),
            BP0111: new FormControl(null),
            BP0112: new FormControl(null),
            BP0113: new FormControl(null),
        }),
        // 保存信息
        saveInfo: () => {
            if (!this.commonService.formVerify(this.positionInfoIfy.form)) {
                return;
            }
            const param = {
                keyId: this.userInfo.unitId,
                childId: this.positionListIfy.current[this.tableId + '_ID'],
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                changeType: WfDataChangeTypeEnum.MODIFY,
                tableId: this.tableHelper.getTableCode('BP01'),
                data: { 
                    ...this.positionInfoIfy.form.getRawValue(),
                    BP0110A: this.positionInfoIfy.zh_CN['BP0110A'],
                    BP0111A: this.positionInfoIfy.zh_CN['BP0111A'],
                },
            };
            this.workFlowService.saveChangeData(param).subscribe(res => {
                const data = { ...res.data };
                data[this.tableId + '_ID'] = res.childId;
                this.positionListIfy.list[this.positionListIfy.index] = data;
                this.positionInfoIfy.zh_CN = data;
            });
        },
    };

    constructor(
        private service: TibetPlanApplyService,
        private commonService: CommonService,
        private workFlowService: WorkflowService,
        private tableHelper: WfTableHelper,
        private loading: LoadingService
    ) {}

    ngOnInit(): void {}
}
