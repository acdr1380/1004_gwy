import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import * as moment from 'moment';
import { TibetPlanApplyService } from '../tibet-plan-apply.service';

@Component({
    selector: 'gl-tibet-plan-apply-excel',
    templateUrl: './tibet-plan-apply-excel.component.html',
    styleUrls: ['./tibet-plan-apply-excel.component.scss'],
})
export class TibetPlanApplyExcelComponent implements OnInit, AfterViewInit {
    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
            this.setExcelList();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Output() operDataChange = new EventEmitter<any>();

    @ViewChild('excelView') private excelViewEl: ExcelControlComponent;

    /**
     * 表册相关
     */
    formListIfy = {
        list: [],
        current: null,
        index: 0,
        setExcelData: index => {
            this.formListIfy.index = index;
            this.formListIfy.current = this.formListIfy.list[index];

            this.formListIfy.xmlData.permission = this.formListIfy.current.permission;
            this.formListIfy.xmlData.params = this.formListIfy.current.param;
        },
        fixed: {
            list: [
                { text: '附件信息', icon: 'file', tag: 'file' },
                { text: '考招详情', icon: 'cluster', tag: 'cluster' },
                { text: '打印', icon: 'printer', tag: 'printer' },
                { text: '下载', icon: 'download', tag: 'down' },
            ],
            click: item => {
                switch (item.tag) {
                    case 'cluster':
                        break;
                    case 'printer':
                        break;
                    case 'down':
                        this.excelViewEl.down();
                        break;
                    case 'file':
                        break;
                }
            },
        },
        xmlData: {
            permission: 'tibet_exam_record_plan',
            params: {},
        },
    };

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {}

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    setExcelList() {
        this.formListIfy.list = [
            {
                text: '用编进人申请处理单',
                permission: 'tibet_exam_record_plan',
                param: this.jobStepInfo,
            },
        ];
        this.formListIfy.setExcelData(0);
    }

    /** 刷新表册数据 */
    public loadExcelData() {
        this.formListIfy.xmlData.params = Object.assign({}, this.jobStepInfo);
    }
}
