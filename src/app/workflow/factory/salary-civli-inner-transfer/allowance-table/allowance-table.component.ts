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
import { AllowanceTableService } from './allowance-table.service';

import { InnerAllowEditComponent } from '../inner-allow-edit/inner-allow-edit.component';
import { JBT } from '../allowance-field/JBT';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'allowance-table',
    templateUrl: './allowance-table.component.html',
    styleUrls: ['./allowance-table.component.scss'],
})
export class AllowanceTableComponent implements OnInit, AfterViewInit {
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private service: AllowanceTableService,
        private message: NzMessageService
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

    @Input() cannotEdit = false;
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
    @Input() isImport = null;
    @Input() set isUpdate(v) {
        if (v) {
            this.getTableData();
        }
    }

    /**
     * 是否可编辑
     */
    @Input() isUsable;

    /**
     * 表格字段
     */
    JBT_TABLE_FIELDS = JBT;
    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;

    @ViewChild('allowEditComponent', { static: false })
    _allowEditComponent: InnerAllowEditComponent;

    @Output() calculateChange = new EventEmitter<any>();
    /**
     * 人员表格
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
            if (this.cannotEdit) {
                return;
            }
            this.personTableIfy.status = event;
            this._allowEditComponent.show();
        },
        calculateChange: () => {
            // 计算后刷新表格
            this.getTableData();
            this.calculateChange.emit();
        },
    };

    loading = false;
    ngOnInit() { }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    /**
     * 获取表格数据
     */
    getTableData() {
        const data = {
            // wfId: this.parentService.wfId,
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.person],
        };
        this.service.getSpecailWfData(data).subscribe(result => {
            this.personTableIfy.data = result;
        });
    }

    calculation() {
        this.loading = true;
        const par = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            handlerIds: ['601'],
            keyIds: [this.person],
        };
        this.workflowService.salaryCivilCalculation(par).subscribe(result => {
            this.loading = false;
            // 计算后刷新表格
            this.getTableData();
            this.calculateChange.emit();
            // 需要刷新核定工资
        });
    }
}
