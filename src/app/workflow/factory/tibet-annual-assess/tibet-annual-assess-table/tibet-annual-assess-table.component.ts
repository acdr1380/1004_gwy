import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { LoadingService } from 'app/components/loading/loading.service';
import { Base64 } from 'js-base64';
import { TibetAnnualAssessService } from '../tibet-annual-assess.service';

@Component({
    selector: 'tibet-annual-assess-table',
    templateUrl: './tibet-annual-assess-table.component.html',
    styleUrls: ['./tibet-annual-assess-table.component.scss']
})
export class TibetAnnualAssessTableComponent implements OnInit, AfterViewInit {
    constructor(
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private service: TibetAnnualAssessService,
        private tableHelper: WfTableHelper,
        private loading: LoadingService,
    ) { }

    isFullScreen = false;

    /**
     * 业务是否可编辑
     */
    canEdit = false;

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;
            this.getTabAndTableData();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;
    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;
    /**
     * 第二步 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04'],
        },
        /**
         * 选择人员
         */
        evtSelectPerson: () => {
            this.operSelectPerson.show();
        },
        // 确认选人后执行
        evtChange: () => {
            this.riesTabIfy.selectIndex = 0;
            this.getTabAndTableData();
        },
        psnDataChange: () => {
            // 人员禁选列表
            return this.riesTabIfy.radioTABLE_DATA.map(
                p => p[`${this.tableHelper.getTableCode('A01')}_ID`]
            );
        },
    };

    /**
     * 标签页相关
     */
    riesTabIfy = {
        selectIndex: 0,
        // 标签页显示标题
        list: [],
        change: () => {
            // isShowA14
            // A1517=1并且（A1533=1或者A1534=1）时显示并可以编辑A14子集
            // 奖惩名称代码 A1404B，批准日期 A1407，批准机关 A1411A，受奖惩时职务层次 A1415
            const data = this.riesTabIfy.list[this.riesTabIfy.selectIndex];
            // 表格数据赋值
            this.riesTabIfy.radioTABLE_DATA = data.TABLE_DATA.map(d => {
                return {
                    ...d,
                    keyId: d[`${this.tableHelper.getTableCode('A01')}_ID`],
                    isShowA14: (d.A1517 === 1 && d.A1533 === 1) || (d.A1517 === 1 && d.A1534 === 1)
                }
            });
        },

        /**
         * 当前选中的考核类型
         */
        radioValue: null,
        // 表格数据
        radioTABLE_DATA: [],
        radioChange: () => {
            const data = this.riesTabIfy.list[this.riesTabIfy.selectIndex].DATA;
            const item = data.find(v => v.VALUE === this.riesTabIfy.radioValue);
            // 表格数据赋值
            this.riesTabIfy.radioTABLE_DATA = item.TABLE_DATA;
        },

        // 人员表格
        table: {
            loading: false,
            /**
             * 当前选中人员keyId
             */
            selectedKeyId: null,
            pageIndex: 1,
            pageSize: 10,
            widthConfig: [
                '40px',
                '100px', // 姓名
                '150px',
                '80px', // 性别
                '100px',
                '120px',

                '100px', // 考核年份
                '100px',
                '100px',
                '100px',
                '100px',
                '100px', //嘉奖标识
                '100px',
                '100px',
                '80px',
            ],
            headArr: Array(15),
            scrollConfig: { x: '2200px', y: '450px' },
        },
    };

    /**
     * 考核信息编辑
     */
    assessEditIfy = {
        visible: false,
        width: 440,
        title: '考核信息',
        form: new FormGroup({
            A1521: new FormControl(null, [Validators.required]),
            A1517: new FormControl(null, [Validators.required]),
            A1523: new FormControl(null, [Validators.required]),
            A1531: new FormControl(null, [Validators.required]),
            A1532: new FormControl(null, [Validators.required]),
            A1533: new FormControl(null, [Validators.required]),
            A1534: new FormControl(null, [Validators.required]),
            A1535: new FormControl(null),
        }),
        // 当前选中人员信息
        currentRowData: <any>{},
        open: () => (this.assessEditIfy.visible = true),
        close: () => (this.assessEditIfy.visible = false),

        // 年度考核信息初始化
        assessEdit: item => {
            if (!this.canEdit) {
                return;
            }
            this.assessEditIfy.currentRowData = item;
            // 表单赋值
            this.assessEditIfy.form.reset(this.assessEditIfy.currentRowData);
            this.assessEditIfy.open();
        },
        // 保存考核信息
        save: () => {
            if (this.commonService.formVerify(this.assessEditIfy.form)) {
                const resultData = {
                    keyId: this.assessEditIfy.currentRowData.keyId,
                    childId: this.assessEditIfy.currentRowData[`${this.tableHelper.getTableCode('A15')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: this.tableHelper.getTableCode('A15'),
                    data: {
                        ...this.assessEditIfy.form.getRawValue(),
                    },
                };
                this.workflowService.saveChangeData(resultData).subscribe(() => {
                    this.getTabAndTableData();
                    this.assessEditIfy.close();
                });
            }
        },
    };

    /**
     * 奖惩信息信息编辑
     */
    a14ChildEditIfy = {
        visible: false,
        width: 440,
        title: '奖惩信息',
        form: new FormGroup({
            A1404B: new FormControl(null, [Validators.required]),
            A1407: new FormControl(null, [Validators.required]),
            A1411A: new FormControl(null, [Validators.required]),
            A1415: new FormControl(null, [Validators.required]),
        }),
        // A14子集
        a14ChildData: {},
        currentSelectedPsn: null,
        open: () => (this.a14ChildEditIfy.visible = true),
        close: () => (this.a14ChildEditIfy.visible = false),

        // 奖惩信息初始化
        a14Edit: async item => {
            this.a14ChildEditIfy.currentSelectedPsn = item;
            const tableCode = this.tableHelper.getTableCode('A14');
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [item.keyId],
                childFields: { [tableCode]: [] },
            };
            const result = await this.workflowService.getPsnList(this.service.wfId, params).toPromise();
            if (result[tableCode] && result[tableCode].length > 0) {
                this.a14ChildEditIfy.a14ChildData = result[tableCode].find(d => d.IS_LAST_ROW);
                // 表单赋值
                this.a14ChildEditIfy.form.reset(this.a14ChildEditIfy.a14ChildData);
            } else {
                this.a14ChildEditIfy.a14ChildData = {};
                this.a14ChildEditIfy.form.reset();
            }
            this.a14ChildEditIfy.open();
        },
        // 保存奖惩信息
        save: () => {
            if (this.commonService.formVerify(this.a14ChildEditIfy.form)) {
                const resultData = {
                    keyId: this.a14ChildEditIfy.currentSelectedPsn.keyId,
                    childId:
                        this.a14ChildEditIfy.a14ChildData[`${this.tableHelper.getTableCode('A14')}_ID`]
                            ? this.a14ChildEditIfy.a14ChildData[`${this.tableHelper.getTableCode('A14')}_ID`]
                            : -1,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType:
                        this.a14ChildEditIfy.a14ChildData[`${this.tableHelper.getTableCode('A14')}_ID`]
                            ? WfDataChangeTypeEnum.MODIFY
                            : WfDataChangeTypeEnum.ADD,
                    tableId: this.tableHelper.getTableCode('A14'),
                    data: {
                        ...this.a14ChildEditIfy.form.getRawValue(),
                    },
                };
                this.workflowService.saveChangeData(resultData).subscribe(() => {
                    this.a14ChildEditIfy.close();
                });
            }
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
     * 干部审批表
     */
    personExcelIfy = {
        visible: false,
        width: 960,
        title: '人员干部审批表',
        open: (item) => {
            this.personExcelIfy._setParams(item);
            this.personExcelIfy.visible = true
        },
        close: () => (this.personExcelIfy.visible = false),
        permission: 'tibet_person_initialize_002',
        params: null,
        _setParams: (item) => {
            const { jobId, jobStepId } = this.jobStepInfo;
            this.personExcelIfy.params = {
                jobId,
                jobStepId,
                [`${this.tableHelper.getTableCode('A01')}_ID`]: item.keyId
            };
        },
    };

    ngOnInit() { }

    ngAfterViewInit() {
        // 计算表格虚拟滚动宽高
        // fromEvent(window, 'resize')
        //     .pipe(debounceTime(300))
        //     .subscribe(() => {
        //         this.computePersonTableXY();
        //     });
        const objResizeObserver = new window['ResizeObserver'](entries => {
            // const [entry] = entries;
            // const cr = entry.contentRect;
            // const target = entry.target;
            this.computePersonTableXY();
        });
        // 观察文本域元素
        objResizeObserver.observe(this.personTableElement.nativeElement);

        setTimeout(() => {
            this.computePersonTableXY();
        }, 500);
    }

    /**
     * 计算表格虚拟滚动宽高
     */
    computePersonTableXY() {
        const width = this.riesTabIfy.table.widthConfig
            // tslint:disable-next-line:radix
            .map(v => parseInt(v))
            .reduce((accumulator, currentValue) => accumulator + currentValue);
        const el = this.personTableElement.nativeElement;

        const height = el.offsetHeight - 160; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        this.riesTabIfy.table.scrollConfig = { x: `${width}px`, y: `${height}px` };
        this.cdr.detectChanges();
    }

    /**
     * 获取业务标签表格信息
     */
    getTabAndTableData() {
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        this.service.selectTabAndTableData(params).subscribe(result => {
            this.riesTabIfy.list = result;
            if (result.length > 0) {
                this.riesTabIfy.change();
            } else {
                this.riesTabIfy.radioValue = null;
                this.riesTabIfy.radioTABLE_DATA = [];
            }
        });
    }

    // 撤选
    deletePerson(item) {
        if (!this.canEdit) {
            return;
        }
        this.modalService.confirm({
            nzTitle: '系统提示?',
            nzContent: `<b style="color: red;">确定要撤选该人员吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.riesTabIfy.table.loading = true;
                const data = {
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyIds: [item[`${this.tableHelper.getTableCode('A01')}_ID`]],
                };
                this.workflowService.deletePerson(this.jobStepInfo.wfId, data).subscribe(result => {
                    this.getTabAndTableData();
                    this.riesTabIfy.table.loading = false;
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }

    // 全屏
    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }

}
