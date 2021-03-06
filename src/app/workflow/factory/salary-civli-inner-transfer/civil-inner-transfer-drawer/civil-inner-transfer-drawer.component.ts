import { Component, Input, OnInit } from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { SalaryCivliInnerTransferService } from '../salary-civli-inner-transfer.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'civil-inner-transfer-wfinfo-drawer',
    templateUrl: './civil-inner-transfer-drawer.component.html',
    styleUrls: ['./civil-inner-transfer-drawer.component.scss']
})
export class CivilInnerTransferDrawerComponent implements OnInit {

    constructor(
        private service: SalaryCivliInnerTransferService,
        private workService: WorkflowService,
    ) { }

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Input() type;

    /**
     * 变化后执行
     */
    @Input()
    set isChange(v) {
        if (v) {
            this.show();
        }
    }

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
            this.workService.getOperStepList(this.service.wfId).subscribe(result => {
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
            this.workService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => {
                    this.operTailIfy.list = result;
                });
        },
    };

    ngOnInit(): void {
    }

    show() {
        if (this.type === 'step') {
            this.operStepFlowIfy.open();
        } else {
            this.operTailIfy.open();
        }
    }

}
