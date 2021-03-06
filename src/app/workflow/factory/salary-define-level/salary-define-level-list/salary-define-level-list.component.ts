import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { WorkflowService } from 'app/workflow/workflow.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { Base64 } from 'js-base64';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { ElementRef } from '@angular/core';
import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { SalaryGzda07JbtDrawerComponent } from 'app/components/salary-gzda07-jbt/salary-gzda07-jbt-drawer/salary-gzda07-jbt-drawer.component';

@Component({
    selector: 'gl-salary-define-level-list',
    templateUrl: './salary-define-level-list.component.html',
    styleUrls: ['./salary-define-level-list.component.scss'],
})
export class SalaryDefineLevelListComponent implements OnInit, AfterViewInit {
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private commonService: CommonService,
        private tableHelper: WfTableHelper
    ) {}

    isFullScreen = false;
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
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;

            this.personListIfy._loadPersonList(true);
            this.formListIfy.evtChange({ index: 0 });
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Output() auditChange = new EventEmitter<any>();

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

            this.workflowService.getOperStepList(this.jobStepInfo.wfId).subscribe(result => {
                this.operStepFlowIfy.list = result;
            });
        },
    };

    /**
     * 流程监控
     */
    operTailIfy = {
        title: '业务跟踪',
        width: 480,
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

    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表相关
     */
    personListIfy = {
        find: {
            // 搜索框
            searchWidth: 160,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    return;
                }
                const { pageSize } = this.personListIfy.pagination;
                // 查找位置
                const location = this.personListIfy.listAll.findIndex(item => item.keyId === value);
                // 计算位置所在页
                // tslint:disable-next-line:no-bitwise
                this.personListIfy.pagination.pageIndex = ~~(location / pageSize) + 1;
                // 重载分页
                this.personListIfy.pagination.initPage();

                // 定位选中
                const index = this.personListIfy.list.findIndex(item => item.keyId === value);
                this.scrollViewPersonList.scrollToIndex(index);
                this.personListIfy.evtSelectedPerson(this.personListIfy.list[index]);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.listAll.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
        },

        /**
         * 加载人员列表
         */
        _loadPersonList: (isRef = false) => {
            if (this.personListIfy.listAll.length > 0 && !isRef) {
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.workflowService.getWfPersonList(this.jobStepInfo.wfId, data).subscribe(result => {
                if (!!result && result.length > 0) {
                    this.personListIfy.listAll = result.map(item => {
                        return {
                            ...item,
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        };
                    });
                    this.personListIfy.pagination.pageChange(true);
                }
            });
        },

        selectedPerson: null,
        listAll: [],
        list: [],
        /**
         * 选中人员
         */
        evtSelectedPerson: person => {
            this.personListIfy.selectedPerson = person;
            this.formListIfy.evtChange({ index: 0 });
        },
        /**
         * 审批-单人
         */
        evtAuditPerson: item => {
            this.auditPersonIfy.title = '人员审批';
            this.auditPersonIfy.isBatch = false;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset(item);
        },
        /**
         * 批量审批
         */
        evtBatchAudit: () => {
            this.auditPersonIfy.title = '人员批量审批';
            this.auditPersonIfy.isBatch = true;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset();
        },
        /**
         * 查看审批
         */
        evtSeeAudit: item => {
            this.personAuditViewIfy.personId = item.keyId;
            this.personAuditViewIfy.open();
        },

        pagination: {
            initPage: () => {
                const { pageSize, pageIndex } = this.personListIfy.pagination;
                this.personListIfy.pagination.total = this.personListIfy.listAll.length;
                this.personListIfy.list =
                    this.personListIfy.listAll.length > 0
                        ? this.personListIfy.listAll.slice(
                              pageSize * (pageIndex - 1),
                              pageIndex * pageSize
                          )
                        : [];
            },
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            /**
             * 基本子集数据分页
             */
            pageChange: (reset = false) => {
                if (reset) {
                    this.personListIfy.pagination.pageIndex = 1;
                }
                this.personListIfy.pagination.initPage();

                const [first] = this.personListIfy.list;
                this.personListIfy.evtSelectedPerson(first);
                this.cdr.detectChanges();
            },
        },
    };

    @ViewChild('personAuditFormElement', { static: false })
    personAuditFormElement: ElementRef;

    /**
     * 表册相关
     */
    formListIfy = {
        selectedIndex: 0,
        tag: '',
        status: false,
        list: [
            {
                name: '机关事业单位工作人员工资变动审批表',
                tag: 'b1',
                permission: 'wage_change_table001',
            },
            {
                name: '事业单位工作人员工资变动核定(统计)表',
                tag: 'b2',
                permission: 'wage_adjustment_audit001',
            },
            {
                name: '事业单位工作人员工资变动花名册',
                tag: 'b3',
                permission: 'payroll_change_roster001',
            },
        ],
        evtChange: ({ index }) => {
            const item = this.formListIfy.list[index];
            this.formListIfy.tag = item.tag;
            switch (item.tag) {
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
            this.personFormIfy.permission = item.permission;
            this.personFormIfy._setParams();
            this.cdr.detectChanges();
        },
    };

    /**
     * 人员表册
     */
    personFormIfy = {
        permission: null,
        params: null,
        _setParams: () => {
            if (!this.personListIfy.selectedPerson) {
                return;
            }
            const { jobId, jobStepId } = this.jobStepInfo;
            const { keyId } = this.personListIfy.selectedPerson;
            this.personFormIfy.params = {
                jobId,
                jobStepId,
                // DATA_PERSON_A01_ID: keyId,
            };
            this.personFormIfy.params[`${this.tableHelper.getTableCode('A01')}_ID`] = keyId;
        },
        evtDataChange: event => {
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const data = {};
            data[event.field.column.TABLE_COLUMN_CODE] = event.value;
            const params = {
                ...event.cellConfig,
                jobId,
                jobStepId,
                jobDataId,
                changeType: 1,
                tableId: event.field.tableCode,
                data,
            };
            this.workflowService.saveChangeData(params).subscribe();
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
                const personInfo = this.personListIfy.selectedPerson;
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
        /**
         * 保存审批结果
         */
        evtSaveAudit: () => {
            if (this.workflowService.formVerify(this.auditPersonIfy.form)) {
                const data = this.auditPersonIfy.form.getRawValue();
                if (this.auditPersonIfy.isBatch) {
                    const datas = this.personListIfy.listAll.map(item => {
                        return {
                            ...data,
                            keyValue: item.keyId,
                            auditType: WfParamDataAuditTypeEnum.DATA,
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobParamId: this.jobStepInfo.jobParamId,
                        };
                    });
                    this.workflowService.batchSaveAudit(datas).subscribe(result => {
                        // 设置审批结果
                        this.personListIfy.listAll.forEach(item => {
                            item.auditState = data.auditState;
                            item.auditStateDesc = data.auditStateDesc;
                        });
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
                    return;
                }
                const personInfo = this.personListIfy.selectedPerson;
                data.keyValue = personInfo.keyId;
                data.auditType = WfParamDataAuditTypeEnum.DATA;

                this.workflowService
                    .saveAudit({
                        ...data,
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        jobParamId: this.jobStepInfo.jobParamId,
                    })
                    .subscribe(result => {
                        // 设置审批结果
                        personInfo.auditState = data.auditState;
                        personInfo.auditStateDesc = data.auditStateDesc;
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
            }
        },
    };

    @ViewChild('salaryGZDA07JBTElement') salaryGZDA07JBTElement: SalaryGzda07JbtDrawerComponent;

    /**
     * 信息展示
     */
    showPersonInfoIfy = {
        list: [
            { label: '附件资料', icon: 'folder', tag: 'file', status: false },
            { label: '人员信息', icon: 'user', tag: 'all', status: false },
            // { label: '信息变动情况', icon: 'file-sync', tag: 'person-sync' },
            { label: '工资变动情况', icon: 'transaction', tag: 'salary-sync', status: false },
            { label: '津补贴变动明细', icon: 'transaction', tag: 'jbt-sync', status: false },
            { label: '下载', icon: 'download', tag: 'down', status: false },
        ],
        showContent: item => {
            switch (item.tag) {
                case 'file':
                    this.personAnnexIfy.open();
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
                    this.salaryGZDA07JBTElement.open({
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyId: this.personListIfy.selectedPerson.keyId,
                    });
                    break;
                case 'down':
                    this.personSalaryExcelElement.down();
                    break;
            }
        },
    };

    @ViewChild('personSalaryExcelElement', { static: false })
    personSalaryExcelElement: ExcelControlComponent;
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 人员附件
     */
    personAnnexIfy = {
        visible: false,
        title: '人员附件',
        width: 400,
        close: () => (this.personAnnexIfy.visible = false),
        open: () => {
            this.personAnnexIfy._loadFileList();
            this.personAnnexIfy.visible = true;
        },

        _loadFileList: () => {
            const { keyId } = this.personListIfy.selectedPerson;
            const data = {
                keyId,
                jobId: this.jobStepInfo.jobId,
            };
            this.workflowService.getPersonFileList(data).subscribe(result => {
                this.personAnnexIfy.fileList = result.map(file => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    return {
                        ...file,
                        thumbUrl,
                        operFiles: file,
                        fileName: file.fileName,
                        url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                        name: file.fileName,
                    };
                });
            });
        },

        selectedIndex: 0,
        fileList: [],
        preview: file => {
            const index = this.personAnnexIfy.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
        },
    };

    /**
     * 人员工资信息
     */
    personSalaryInfoIfy = {
        params: null,
        open: () => {
            const row = this.personListIfy.selectedPerson;
            const GL = Base64.encode(
                JSON.stringify({
                    name: escape(row.A0101),
                    keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    type: 'sy',
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
            const { keyId } = this.personListIfy.selectedPerson;
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
            { TABLE_COLUMN_CODE: 'GZDA0721', TABLE_COLUMN_NAME: '技术工等级工资' },
            { TABLE_COLUMN_CODE: 'GZDA0719', TABLE_COLUMN_NAME: '岗位工资' },
            { TABLE_COLUMN_CODE: 'GZDA0720', TABLE_COLUMN_NAME: '薪级工资' },
            { TABLE_COLUMN_CODE: 'GZDA0723', TABLE_COLUMN_NAME: '试用期工资' },
            { TABLE_COLUMN_CODE: 'GZDA0729', TABLE_COLUMN_NAME: '提高10%工资' },
            { TABLE_COLUMN_CODE: 'GZDA0722', TABLE_COLUMN_NAME: '浮动工资' },
            { TABLE_COLUMN_CODE: 'GZDA0727', TABLE_COLUMN_NAME: '薪级起考年度' },
        ],
    };

    ngOnInit() {}

    ngAfterViewInit() {}

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
