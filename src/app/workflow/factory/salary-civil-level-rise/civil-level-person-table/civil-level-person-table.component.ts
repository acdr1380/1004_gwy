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
import { SalaryCivilLevelRiseService } from '../salary-civil-level-rise.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { SalaryGz07DrawerComponent } from 'app/components/salary-gz07/salary-gz07-drawer/salary-gz07-drawer.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { LoadingService } from 'app/components/loading/loading.service';
import { Base64 } from 'js-base64';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 's-level-person-table',
    templateUrl: './civil-level-person-table.component.html',
    styleUrls: ['./civil-level-person-table.component.scss'],
})
export class CivilLevelPersonTableComponent implements OnInit, AfterViewInit {
    constructor(
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private service: SalaryCivilLevelRiseService,
        private tableHelper: WfTableHelper,
        private loading: LoadingService
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
    @ViewChild('salaryGZ07Element', { static: false }) salaryGZ07Element: SalaryGz07DrawerComponent;
    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;
    /**
     * 第二步 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
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
            const data = this.riesTabIfy.list[this.riesTabIfy.selectIndex].DATA;
            const [first] = data;
            if (!first) {
                this.riesTabIfy.radioTABLE_DATA = [];
                this.riesTabIfy.radioValue = null;
                return;
            }
            if (!first.VALUE) {
                this.riesTabIfy.radioValue = null;
                this.riesTabIfy.radioTABLE_DATA = data;
                return;
            }
            // 设置考核类型选中
            this.riesTabIfy.radioValue = first.VALUE;
            this.riesTabIfy.radioChange();
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
                '100px',
                '150px',
                '80px', // 职务工资
                '120px',
                '60px', // 变动情况

                '100px',
                '100px',
                '100px',
                '100px', //
                '100px', //工资合计

                '80px',
                '80px',
                '80px',
                '80px',// 未晋升原因

                '40px',
                '40px',
                '40px',
            ],
            headArr: Array(19),
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
            GZ0601: new FormControl({ value: null, disabled: true }),
            GZ0602: new FormControl(null, [Validators.required]),
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
            this.assessEditIfy.form.reset({
                GZ0601: item.GZ0601,
                GZ0602: item.GZ0602,
            });
            this.assessEditIfy.open();
        },
        // 保存考核信息
        save: () => {
            if (this.commonService.formVerify(this.assessEditIfy.form)) {
                const resultData = {
                    keyId: this.assessEditIfy.currentRowData[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                    childId: this.assessEditIfy.currentRowData.GZ06Id,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: this.tableHelper.getTableCode('GZ06'),
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
     * 未晋升原因抽屉相关
     */
    viewIsNotRiseIfy = {
        visible: false,
        width: 440,
        title: '未晋升原因',
        GZDA0760: '',
        open: () => (this.viewIsNotRiseIfy.visible = true),
        close: () => (this.viewIsNotRiseIfy.visible = false),
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

    /**
     * 计算
     */
    calculation(data) {
        if (!this.canEdit) {
            return;
        }
        const _loading = this.loading.show();
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            isAllData: true,
            handlerIds: ['E01'],
            keyIds: [data[`${this.tableHelper.getTableCode('A01')}_ID`]],
        };
        this.workflowService.salaryCivilCalculation(params).subscribe(result => {
            _loading.close();
            if (result) {
                this.getTabAndTableData();
            }
        });
    }

    /**
     * 全部计算
     */
    salaryExecuteAll() {
        if (!this.canEdit || this.riesTabIfy.radioTABLE_DATA.length === 0) {
            return;
        }
        const _loading = this.loading.show();
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            isAllData: true,
            handlerIds: ['E01'],
            keyIds: [],
        };
        this.workflowService.salaryCivilCalculation(params).subscribe(result => {
            _loading.close();
            if (result) {
                this.getTabAndTableData();
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

    // 查看未晋升原因
    viewIsNotRise(item) {
        this.viewIsNotRiseIfy.GZDA0760 = item.GZDA0760;
        this.viewIsNotRiseIfy.open();
    }

    // 查看工资变迁
    wageChange(item) {
        this.riesTabIfy.table.selectedKeyId = item[`${this.tableHelper.getTableCode('A01')}_ID`];
        this.salaryGZ07Element.show();
    }

    // 全屏
    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }

    loadSalaryInfo(row) {
        const GL = Base64.encode(
            JSON.stringify({
                name: escape(row.A0101),
                keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                wfId: this.jobStepInfo.wfId,
            })
        );
        const url = `irregular/oper-salary-info-page`;

        window.winOperSalaryInfoDlg = window.open(`${url};GL=${GL}`, 'salary-Info');
        if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
            window.winOperSalaryInfoDlg.focus();
        }
        // this.router.navigate([url, { GL }]);
    }
}
