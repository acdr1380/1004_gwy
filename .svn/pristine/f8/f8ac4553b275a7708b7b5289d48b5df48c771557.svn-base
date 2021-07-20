import { Component, OnInit, Input } from '@angular/core';
import { GZ07 as GZ07_gwy } from './GZ07_gwy';
import { GZ07 as GZ07_sy } from './GZ07_sy';
import { WorkflowService } from 'app/workflow/workflow.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'salary-gz07',
    templateUrl: './salary-gz07.component.html',
    styleUrls: ['./salary-gz07.component.scss'],
})
export class SalaryGZ07Component implements OnInit {
    columnTypeEnum = ColumnTypeEnum;
    /**
     * 业务信息
     */
    @Input() jobStepInfo: JobStepInfo;

    _keyId;
    @Input() set keyId(v) {
        this._keyId = v;
        if (v) {
            this.loadSalaryGZ07Data();
        }
    }
    get keyId() {
        return this._keyId;
    }

    @Input() type: 'sy' | 'gwy' = 'gwy';
    @Input() size = 15;

    /**
     * 工资表格
     */
    salaryTableIfy = {
        fields: [],
        data: [],
    };
    constructor(private workflowService: WorkflowService) {}

    ngOnInit() {
        this.salaryTableIfy.fields = this.type === 'sy' ? GZ07_sy : GZ07_gwy;
    }

    /**
     * 加载变迁数据
     */
    loadSalaryGZ07Data() {
        this.workflowService
            .getwfPersonDataList(this.jobStepInfo, this.keyId, 'DATA_1002_PERSON_GZ07')
            .subscribe(result => {
                this.salaryTableIfy.data = result;
            });
    }
}
