import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { SalaryTwoYearRiseService } from '../salary-two-year-rise.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { filter } from 'rxjs/internal/operators/filter';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';
import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { Base64 } from 'js-base64';
import { JBT } from './fields/JBT';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 's-tow-year-form-list',
    templateUrl: './tow-year-form-list.component.html',
    styleUrls: ['./tow-year-form-list.component.scss'],
})
export class TowYearFormListComponent implements OnInit, AfterViewInit {
    @ViewChild('personListFormElement', { static: false }) personListFormElement: ElementRef;
    // @ViewChild('formMagerElement', { static: false }) formMagerElement: ElementRef;
    // @ViewChild('formBpbElement', { static: false }) formBpbElement: ElementRef;

    /**
     * 业务是否编辑
     */
    canEdit = false;
    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            if (this.jobStepInfo.stepId !== 'start') {
                this.loadStatisticsData();
            }
            this.personListIfy._loadPersonList();
            this.formListIfy.evtChange({ index: 0 });
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Output() auditChange = new EventEmitter();

    isFullScreen = false;

    /**
     * 业务统计
     */
    operStatisticsIfy = {
        noRise: 0,
        rise: 0,
        gq: 0,
    };

    /**
     * 表册相关
     */
    formListIfy = {
        selectedIndex: 0,
        tag: '',
        status: false,
        permission: null,
        params: null,
        list: [
            // {
            //     name: '个人信息',
            //     tag: 'personInfo',
            //     permission: 'wage_change_table001',
            // },
            {
                name: '机关事业单位工作人员工资变动审批表',
                tag: 'b1',
                permission: 'wage_change_table001',
            },
            {
                name: '机关工勤按年度考核结果晋升岗位档次花名册',
                tag: 'b2',
                permission: 'increase_gongqinjindang002',
            },
            {
                name: '机关工勤按年度考核结果晋升岗位档次报批表',
                tag: 'b3',
                permission: 'increas_gongqinjin001',
            },
        ],
        evtChange: ({ index }) => {
            const item = this.formListIfy.list[index];
            this.formListIfy.tag = item.tag;
            switch (item.tag) {
                case 'personInfo':
                    this.formListIfy.status = true;
                    this.personListIfy._loadPersonList();
                    break;
                case 'b1':
                    this.formListIfy.status = true;
                    break;
                case 'b2':
                case 'b3':
                    this.formListIfy.status = false;
                    break;
            }
            this.showPersonInfoIfy.list.forEach(list => {
                if (!this.formListIfy.status) {
                    list.status = list.tag === 'down' ? true : false;
                } else {
                    list.status = true;
                }
            });
            this.formListIfy.permission = item.permission;
            this.formListIfy._setParams();
            this.cdr.detectChanges();
        },
        // SpbTable: {
        //     permission: 'wage_change_table001',
        //     params: {},
        // },
        // HmlXml: {
        //     permission: 'increase_gongqinjindang002',
        //     params: {},
        // },
        // BpbTable: {
        //     permission: 'increas_gongqinjin001',
        //     params: {},
        // },
        _setParams: () => {
            const { jobId, jobStepId } = this.jobStepInfo;
            const { keyId } = this.personListIfy.selectPsnData;
            switch (this.formListIfy.selectedIndex) {
                case 0:
                    this.formListIfy.params = {
                        jobId,
                        jobStepId,
                        [`${this.tableHelper.getTableCode('A01')}_ID`]: keyId,
                    };
                    break;
                case 1:
                    this.formListIfy.params = {
                        jobId,
                        jobStepId,
                    };
                    break;
                case 2:
                    this.formListIfy.params = {
                        jobId,
                        jobStepId,
                    };
                    break;
            }
        },
    };

    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表相关
     */
    personListIfy = {
        find: {
            // 搜索框
            searchWidth: 280,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                this.personListIfy.selectPsnData = this.personListIfy.list.find(
                    item => item.keyId === value
                );
                this.scrollViewPersonList.scrollToIndex(
                    this.personListIfy.list.indexOf(this.personListIfy.selectPsnData)
                );
                this.personListIfy.evtSelectedPerson(this.personListIfy.selectPsnData);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
        },

        /**
         * 加载人员列表
         */
        _loadPersonList: async () => {
            if (this.personListIfy.list.length > 0) {
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            const auditResult = await this.workflowService
                .getWfPersonList(this.jobStepInfo.wfId, data)
                .toPromise();
            const tableResult = await this.service.selectTabAndTableData(data).toPromise();

            if (auditResult && auditResult.length > 0) {
                this.personListIfy.psnAuditData = auditResult;
                // 审批和预览界面只显示已晋升和未晋升人员
                const psnRise = tableResult.find(d => d.VALUE === 'IS_RISE');
                const psnNotRise = tableResult.find(d => d.VALUE === 'IS_NOT_RISE');
                if (psnRise.DATA.length === 0 && psnNotRise.DATA.length === 0) {
                    // 不存在已晋升和未晋升人员时
                    this.personListIfy.list = [];
                    return;
                }
                this.riesTabIfy.list.push(psnRise, psnNotRise);
                this.riesTabIfy.list = [...this.riesTabIfy.list];
                const [first] = this.riesTabIfy.list;
                // 设置考核类型选中
                this.riesTabIfy.radioValue = first.VALUE;
                // 晋级，晋档标签
                this.riesTabIfy.radioChange();
            }
        },

        selectPsnData: null,
        list: [],
        // 审批信息
        psnAuditData: [],
        evtSelectedPerson: item => {
            this.personListIfy.selectPsnData = item;
            this.formListIfy._setParams();
        },
        evtAuditPerson: (item, event) => {
            event.stopPropagation();
            this.personListIfy.selectPsnData = item;
            this.auditPersonIfy.title = '人员审批';
            this.auditPersonIfy.isBatch = false;
            this.auditPersonIfy.open();
        },
        evtBatchAudit: () => {
            this.auditPersonIfy.title = '人员批量审批';
            this.auditPersonIfy.isBatch = true;
            this.auditPersonIfy.open();
        },

        /**
         * 查看审批
         */
        evtSeeAudit: item => {
            this.personAuditViewIfy.personId = item.keyId;
            this.personAuditViewIfy.open();
        },
    };

    /**
     * 标签页相关
     */
    riesTabIfy = {
        // 标签页显示标题
        list: [],
        /**
         * 当前选中的考核类型
         */
        radioValue: null,
        radioChange: () => {
            const item = this.riesTabIfy.list.find(v => v.VALUE === this.riesTabIfy.radioValue);
            // 设置考核类型选中
            this.riesTabIfy.radioValue = item.VALUE;
            // 人员列表赋值
            this.personListIfy.list = [];
            if (item.VALUE === 'IS_RISE') {
                // 已晋升标签下没有子标签
                this.personListIfy.list = item.DATA.map(d => {
                    const psn = this.personListIfy.psnAuditData.find(
                        v =>
                            v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            d[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    const { auditId, auditState, auditStateDesc } = psn;
                    return {
                        ...d,
                        text: d.A0101,
                        keyId: d[`${this.tableHelper.getTableCode('A01')}_ID`],
                        auditId,
                        auditState,
                        auditStateDesc,
                    };
                });
            } else {
                // 未晋升标签下有子标签
                item.DATA.forEach(ele => {
                    ele.TABLE_DATA.map(d => {
                        const psn = this.personListIfy.psnAuditData.find(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                d[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                        const { auditId, auditState, auditStateDesc } = psn;
                        this.personListIfy.list.push({
                            ...d,
                            text: d.A0101,
                            keyId: d[`${this.tableHelper.getTableCode('A01')}_ID`],
                            auditId,
                            auditState,
                            auditStateDesc,
                        });
                    });
                });
            }
            this.personListIfy.list = [...this.personListIfy.list];
            // 人员选中
            this.personListIfy.evtSelectedPerson(this.personListIfy.list[0]);
        },
    };

    /**
     * 人员审批
     */
    auditPersonIfy = {
        visible: false,
        title: '人员审批',
        width: 400,
        close: () => (this.auditPersonIfy.visible = false),
        open: () => {
            this.auditPersonIfy._initAuditState();
            this.auditPersonIfy.visible = true;
        },

        isBatch: false,
        form: new FormGroup({
            auditState: new FormControl(null, Validators.required),
            auditStateDesc: new FormControl(null, Validators.required),
        }),
        _initAuditState: () => {
            if (!this.auditPersonIfy.isBatch) {
                const personInfo = this.personListIfy.selectPsnData;
                this.auditPersonIfy.form.reset(personInfo);
            } else {
                this.auditPersonIfy.form.reset();
            }
            this.auditPersonIfy.form
                .get('auditState')
                .valueChanges.pipe(
                    filter(value => value > -1),
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const verifyFields = ['auditStateDesc'];
                    verifyFields.forEach(field => {
                        const control: AbstractControl = this.auditPersonIfy.form.get(field);
                        if (value === 0) {
                            control.setValidators(Validators.required);
                        } else {
                            control.setValue(null);
                            control.clearValidators();
                        }
                    });
                });
        },

        evtSaveAudit: () => {
            if (this.workflowService.formVerify(this.auditPersonIfy.form)) {
                const data = this.auditPersonIfy.form.getRawValue();

                if (this.auditPersonIfy.isBatch) {
                    const datas = this.personListIfy.psnAuditData.map(item => {
                        return {
                            ...data,
                            keyValue: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                            auditType: WfParamDataAuditTypeEnum.DATA,

                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobParamId: this.jobStepInfo.jobParamId,
                        };
                    });
                    this.workflowService.batchSaveAudit(datas).subscribe(result => {
                        // 设置审批结果
                        this.personListIfy.psnAuditData.forEach(item => {
                            item.auditState = data.auditState;
                            item.auditStateDesc = data.auditStateDesc;
                        });
                        // 按当前标签显示人员列表
                        this.riesTabIfy.radioChange();
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
                    return;
                }
                const personInfo = this.personListIfy.selectPsnData;
                data.keyValue = personInfo.keyId;
                data.auditType = WfParamDataAuditTypeEnum.DATA;
                if (personInfo.auditId) {
                    data.id = personInfo.auditId;
                }
                this.workflowService
                    .saveAudit({
                        ...data,
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        jobParamId: this.jobStepInfo.jobParamId,
                    })
                    .subscribe(result => {
                        // 设置审批结果
                        const psn = this.personListIfy.psnAuditData.find(
                            p => data.keyValue === p[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                        psn.auditState = personInfo.auditState = data.auditState;
                        psn.auditStateDesc = personInfo.auditStateDesc = data.auditStateDesc;
                        psn.auditId = personInfo.auditId = result.id;
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
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
     * 人员批复结果
     */
    personAuditViewIfy = {
        visible: false,
        title: '批复信息',
        width: 400,
        close: () => (this.personAuditViewIfy.visible = false),
        open: () => {
            this.personAuditViewIfy._loadAuditList();
            this.personAuditViewIfy.visible = true;
        },
        list: [],
        personId: null,
        personList: [],
        _loadAuditList: () => {
            if (this.personAuditViewIfy.list.length === 0) {
                this.workflowService.getAuditHistory(this.jobStepInfo.jobId).subscribe(result => {
                    this.personAuditViewIfy.list = result;
                    this.personAuditViewIfy._buildPersonAuditList();
                });
            } else {
                this.personAuditViewIfy._buildPersonAuditList();
            }
        },
        _buildPersonAuditList: () => {
            this.personAuditViewIfy.personList = this.personAuditViewIfy.list
                .filter(item => item.keyValue === this.personAuditViewIfy.personId)
                .sort((a, b) => {
                    if (new Date(a.auditDate) > new Date(b.auditDate)) {
                        return -1;
                    }
                    return 1;
                });
        },
    };

    @ViewChild('personSalaryExcelElement', { static: false })
    personSalaryExcelElement: ExcelControlComponent;
    /**
     * 信息展示
     */
    showPersonInfoIfy = {
        list: [
            // { label: '附件资料', icon: 'folder', tag: 'file', status: true },
            { label: '人员信息', icon: 'user', tag: 'all', status: true },
            // { label: '信息变动情况', icon: 'file-sync', tag: 'person-sync', status: true },
            { label: '工资变动情况', icon: 'transaction', tag: 'salary-sync', status: true },
            { label: '津补贴变动明细', icon: 'transaction', tag: 'jbt-sync', status: true },
            { label: '下载', icon: 'download', tag: 'down', status: true },
        ],
        showContent: item => {
            switch (item.tag) {
                case 'file':
                    // this.personAnnexIfy.open();
                    break;
                case 'all':
                    this.personSalaryInfoIfy.open();
                    break;
                case 'person-sync':
                    this.personInfoChangeIfy.open();
                    break;
                case 'salary-sync':
                    this.personSalaryChangeIfy.open();
                    break;
                case 'jbt-sync':
                    this.personJBTChangeIfy.open();
                    break;
                case 'down':
                    this.personSalaryExcelElement.down();
                    break;
            }
        },
    };

    /**
     * 人员工资信息
     */
    personSalaryInfoIfy = {
        params: null,
        open: () => {
            const row = this.personListIfy.selectPsnData;
            const GL = Base64.encode(
                JSON.stringify({
                    name: escape(row.A0101),
                    keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    wfId: this.jobStepInfo.wfId,
                })
            );
            const url = `irregular/oper-salary-info-page;GL=${GL}`;

            window.winOperSalaryInfoDlg = window.open(url, 'report-common');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
            // this.router.navigate(['irregularity/oper-salary-info-page', { GL }]);
        },
    };

    /**
     * 信息变动情况
     */
    personInfoChangeIfy = {
        visible: false,
        title: '信息变动情况',
        width: 480,
        close: () => (this.personInfoChangeIfy.visible = false),
        open: () => {
            this.personInfoChangeIfy.visible = true;
        },
    };

    /**
     * 工资变动情况
     */
    personSalaryChangeIfy = {
        visible: false,
        title: '工资变动情况',
        width: 480,
        close: () => (this.personSalaryChangeIfy.visible = false),
        open: () => {
            this.personSalaryChangeIfy._loadSalaryChangeList();
            this.personSalaryChangeIfy.visible = true;
        },

        _loadSalaryChangeList: () => {
            const { keyId } = this.personListIfy.selectPsnData;
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [keyId],
            };
            this.workflowService.getWfListData(data).subscribe(result => {
                const [first] = result;
                this.personSalaryChangeIfy.rowList.forEach(item => {
                    item[item.TABLE_COLUMN_CODE] = first[item.TABLE_COLUMN_CODE];
                    item[`New${item.TABLE_COLUMN_CODE}`] = first[`New${item.TABLE_COLUMN_CODE}`];
                    item[`New${item.TABLE_COLUMN_CODE}Change`] =
                        first[`New${item.TABLE_COLUMN_CODE}Change`];
                });
                this.personSalaryChangeIfy.rowList.find(v => v.TABLE_COLUMN_CODE === 'GZDA0727')[
                    'NewGZDA0727Change'
                ] = '';
            });
        },
        rowList: [
            { TABLE_COLUMN_CODE: 'GZDA0717', TABLE_COLUMN_NAME: '职务工资' },
            { TABLE_COLUMN_CODE: 'GZDA0718', TABLE_COLUMN_NAME: '级别工资' },
            { TABLE_COLUMN_CODE: 'GZDA0723', TABLE_COLUMN_NAME: '试用期工资' },
            { TABLE_COLUMN_CODE: 'GZDA0732', TABLE_COLUMN_NAME: '提高比例工资' },
            { TABLE_COLUMN_CODE: 'GZDA0725', TABLE_COLUMN_NAME: '级别起算年度' },
            { TABLE_COLUMN_CODE: 'GZDA0726', TABLE_COLUMN_NAME: '档次起算年度' },
        ],
    };

    /**
     * 津补贴变动情况
     */
    personJBTChangeIfy = {
        visible: false,
        title: '津补贴变动情况',
        width: 480,
        close: () => (this.personJBTChangeIfy.visible = false),
        open: () => {
            this.personJBTChangeIfy._loadJBTChangeList();
            this.personJBTChangeIfy.visible = true;
        },

        _loadJBTChangeList: () => {
            const { keyId } = this.personListIfy.selectPsnData;
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [keyId],
            };
            this.workflowService.getWfListData(data).subscribe(result => {
                const [first] = result;
                this.personJBTChangeIfy.rowList.forEach(item => {
                    item[item.TABLE_COLUMN_CODE] = first[item.TABLE_COLUMN_CODE];
                    item[`New${item.TABLE_COLUMN_CODE}`] = first[`New${item.TABLE_COLUMN_CODE}`];
                    item[`New${item.TABLE_COLUMN_CODE}Change`] =
                        first[`New${item.TABLE_COLUMN_CODE}Change`];
                });
            });
        },
        rowList: JBT,
    };

    constructor(
        private commonService: CommonService,
        private service: SalaryTwoYearRiseService,
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.formListIfy.evtChange({ index: 0 });
    }

    /**
     * 加载统计数据
     */
    loadStatisticsData() {
        const { jobId, jobStepId, startOrgId } = this.jobStepInfo;
        this.service.getStatisticsData(jobId, jobStepId, startOrgId).subscribe(result => {
            this.operStatisticsIfy = result;
        });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
