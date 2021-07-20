import {
    Component,
    OnInit,
    AfterViewInit,
    ChangeDetectorRef,
    Input,
    ViewChild,
    EventEmitter,
    Output,
    ElementRef,
} from '@angular/core';
import { WorkflowService } from 'app/workflow/workflow.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import * as _ from 'lodash';

import { JBT } from '../salary-initialize-allowance-field/JBT';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SalaryInitializeAllowanceTableService } from './salary-initialize-allowance-table.service';
import { SalaryInitializeAllowEditComponent } from '../salary-initialize-allow-edit/salary-initialize-allow-edit.component';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'salary-initialize-allowance-table',
    templateUrl: './salary-initialize-allowance-table.component.html',
    styleUrls: ['./salary-initialize-allowance-table.component.scss'],
})
export class SalaryInitializeAllowanceTableComponent implements OnInit, AfterViewInit {
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private service: SalaryInitializeAllowanceTableService,
        private loading: LoadingService,
    ) { }

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
            this.isUsable = v.jobStepState === JobStepStateEnum.PROCESSING;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    _person;
    @Input() set person(v) {
        if (v) {
            this._person = v;
            this.getTableData();
        } else {
            this.personTableIfy.data = [];
        }
    }
    get person() {
        return this._person;
    }

    @Input() set isUpdate(v) {
        if (v) {
            this.personTableIfy.status = '';
            this.getTableData();
        }
    }

    /**
     * 是否可编辑
     */
    @Input() isUsable;

    @Output() calculateChange = new EventEmitter<any>();

    /**
     * 表格字段
     */
    JBT_TABLE_FIELDS = JBT;

    @ViewChild('allowEditComponent', { static: false })
    _allowEditComponent: SalaryInitializeAllowEditComponent;
    /**
     * 津补贴字段表格
     */
    personTableIfy = {
        data: <any>{},
        status: '',
        headArr: Array(6),
        widthConfig: ['200px', '200px', '100px', '100px', '100px', '100px'],
        /**
         * 点击编辑
         */
        edit: event => {
            if (!this.isUsable) {
                return;
            }
            this.personTableIfy.status = event;
            this._allowEditComponent.show();
        },
        // 抽屉表格计算后的回调
        calculateChange: () => {
            // 津补贴抽屉计算后刷新津补贴表格
            this.getTableData();
            this.calculateChange.emit();
        },
    };

    ngOnInit() { }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    /**
     * 获取津补贴表格数据
     */
    getTableData() {
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.person],
        };
        this.service.getSpecailWfData(data).subscribe(result => {
            this.personTableIfy.data = result;
        });
    }

    // 计算
    calculation() {
        const _loading = this.loading.show();
        const par = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            handlerIds: ['601'],
            keyIds: [this.person],
        };
        this.workflowService.salaryCalculation(par).subscribe(result => {
            _loading.close();
            if (result) {
                // 计算后刷新表格
                this.getTableData();
                // 需要刷新核定工资子集数据
                this.calculateChange.emit();
            }
        });
    }
}
