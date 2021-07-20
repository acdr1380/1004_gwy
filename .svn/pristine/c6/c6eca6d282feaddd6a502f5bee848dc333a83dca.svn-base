import { FormGroup, Validators, FormControl } from '@angular/forms';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { SalaryGz07DrawerComponent } from 'app/components/salary-gz07/salary-gz07-drawer/salary-gz07-drawer.component';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { Base64 } from 'js-base64';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { SalaryGzda07JbtDrawerComponent } from 'app/components/salary-gzda07-jbt/salary-gzda07-jbt-drawer/salary-gzda07-jbt-drawer.component';
import { CameraCZURComponent } from 'app/components/camera-czur/camera-czur.component';
import { TibetLevelRiseService } from '../tibet-level-rise.service';
import { JOB_SCHEME } from '../JobScheme';

@Component({
    selector: 'level-rise-table',
    templateUrl: './level-rise-table.component.html',
    styleUrls: ['./level-rise-table.component.scss'],
})
export class LevelRiseTableComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;
    canEdit = false;
    JOB_SCHEME = JOB_SCHEME;
    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;
            this.loadPersonTable();
            this.loadJobScheme();
            this.personTable._getPersonWfData(null);
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;

    /**
     * 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
        },
        psnKeyIds: <any>[],
        evtSelectPerson: () => {
            this.operSelectPerson.show();
        },
        isChange: null,
        evtChange: event => {
            // console.log(event);
            const params = event.map(item => {
                return {
                    keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                    schemeId: this.jobSchemeTabs.currentSchemeData.DATA_3001_UNIT_B06_ID,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                };
            });
            this.service.savePerson(params).subscribe(val => {
                this.loadPersonTable();
            });
        },
        psnDataChange: data => {
            // 撤选人员参数为keyId，导人参数为数组
            if (typeof data === 'string') {
                // 删除禁选人员中的已撤选人员
                const index = this.personSelectIfy.psnKeyIds.findIndex(keyId => data === keyId);
                this.personSelectIfy.psnKeyIds.splice(index, 1);
                this.personSelectIfy.psnKeyIds = [...this.personSelectIfy.psnKeyIds];
                return;
            }
            this.personSelectIfy.psnKeyIds = [];
            this.personSelectIfy.psnKeyIds = data.map(
                psn => psn[`${this.tableHelper.getTableCode('A01')}_ID`]
            );
        },

        batchEdit: () => {},
    };

    @ViewChild('scrolleditAllElement', { static: false })
    scrolleditAllElement: CdkVirtualScrollViewport;
    /**
     * 步骤流程图
     */
    flowChart = {
        visible: false,
        title: '业务路线图',
        height: 220,
        close: () => (this.flowChart.visible = false),
        open: () => {
            this.flowChart.visible = true;
            // 加载步骤信息
            this.flowChart.loadOperStepData();
        },
        /**
         * 路线图总数据
         */
        operStepList: [],
        loadOperStepData: () => {
            if (this.flowChart.operStepList.length > 0) {
                return;
            }
            this.workflowService
                .getOperStepList(this.jobStepInfo.wfId)
                .subscribe(stepInfo => (this.flowChart.operStepList = stepInfo));
        },
        /**
         * 获得当前步骤
         */
        evtGetStepIndex: (): number => {
            if (this.jobStepInfo && this.flowChart.operStepList.length > 0) {
                const index = this.flowChart.operStepList.findIndex(
                    item => item.stepId === this.jobStepInfo.stepId
                );
                return index;
            }
            return 0;
        },
    };

    /**
     * 业务跟踪-办理历史
     */
    tailAfterOper = {
        title: '业务跟踪',
        width: 480,
        visible: false,
        close: () => (this.tailAfterOper.visible = false),
        open: () => {
            this.tailAfterOper.visible = true;
            // 加载办理历史，流程跟踪
            this.tailAfterOper.loadTailAfterList();
        },
        /*
         * 审批历史
         */
        tailAfterList: [],
        loadTailAfterList: () => {
            if (this.tailAfterOper.tailAfterList.length > 0) {
                return;
            }
            this.workflowService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => (this.tailAfterOper.tailAfterList = result));
        },
    };

    @ViewChild('salaryGZDA07JBTElement') salaryGZDA07JBTElement: SalaryGzda07JbtDrawerComponent;

    /**
     * 人员信息标签栏
     */
    personInfoTabs = {
        currentTableCode: '',
        tabsList: [],
        currentIndex: 0,
        addData: {},
        A74TablelData: [],
        SelectedIndexChange: index => {
            if (this.personTable.systemSchemeList[index]) {
                this.personTable.list = [];
                this.personTable.tableHeader =
                    this.personTable.systemSchemeList[index].systemSchemeHeader;
                const code =
                    this.personInfoTabs.tabsList[this.personInfoTabs.currentIndex].TABLE_CODE;
                this.personInfoTabs.currentTableCode = code;
                if (!this.personTable.selectedPerson?.DATA_3001_PERSON_A01_ID) {
                    return;
                }
                this.personTable._getPersonWfData(code);
            } else {
                this.personInfoTabs.currentTableCode = '';
                if (!this.personTable.selectedPerson) {
                    this.message.warning('请选择编辑人员');
                    return;
                }
                const person = this.personTable.selectedPerson;
                const index = this.personTable.personList.findIndex(
                    item =>
                        item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                        person[`${this.tableHelper.getTableCode('A01')}_ID`]
                );
                this.uploaddrawerify.uploadIfy.getPersonFileList(person);
                this.uploaddrawerify.open(person, index);
            }
        },
    };

    /**
     * 人员信息
     */
    personTable = {
        personWfData: null,
        personList: [], // 人员列表
        selectedPerson: null, // 选中人员
        list: [],
        systemSchemeList: [],
        tableHeader: [],
        pagination: {
            pageIndex: 1,
            pageSize: 10,
        },
        deletePerson: person => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [person[`${this.tableHelper.getTableCode('A01')}_ID`]],
                    };
                    this.service.deletePerson(data).subscribe(val => {
                        const index = this.personTable.personList.findIndex(
                            item =>
                                item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                person[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                        this.personTable.personList.splice(index, 1);
                        this.personTable.personList = [...this.personTable.personList];
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtSeeAudit: data => {},
        evtAuditPerson: data => {},
        evtSelectedPerson: data => {
            this.personTable.selectedPerson = data;
            this.personTable.list = [];
            const code = this.personInfoTabs.tabsList[this.personInfoTabs.currentIndex].TABLE_CODE;
            this.personTable._getPersonWfData(code);
        },
        /**
         * 获取业务子集
         */
        _getPersonWfData: code => {
            if (!this.jobStepInfo.jobId) {
                return;
            }
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.workflowService.getPsnList(this.service.wfId, params).subscribe(val => {
                this.personInfoTabs.A74TablelData = val.DATA_3001_PERSON_A74;
                if (!code) {
                    return;
                }
                this.personTable.personWfData = val;
                if (this.personTable.personWfData[code]) {
                    const list = this.personTable.personWfData[code].filter(
                        item =>
                            item[`${code}_A01_ID`] ===
                            this.personTable.selectedPerson.DATA_3001_PERSON_A01_ID
                    );
                    if (code === 'DATA_3001_PERSON_A05') {
                        this.personTable.list = list.filter(item => item.A0524 === '1');
                    } else {
                        this.personTable.list = [...list];
                    }
                }
            });
        },
    };

    /**
     * 人员信息编辑抽屉
     */
    personInfoEdit = {
        visible: false,
        title: '增加或修改',
        width: 400,
        loading: false,
        childId: '',
        form: new FormGroup({}),
        type: WfDataChangeTypeEnum.ADD,
        open: () => {
            this.personInfoEdit.visible = true;
        },
        close: () => {
            this.personInfoEdit.visible = false;
        },
        add: () => {
            if (!this.personTable.selectedPerson) {
                this.message.warning('请选择编辑人员');
                return;
            }
            this.personInfoEdit.type = WfDataChangeTypeEnum.ADD;
            this.personInfoEdit._setFormControl();
            this.personInfoEdit.open();
        },
        edit: data => {
            this.personInfoEdit.type = WfDataChangeTypeEnum.MODIFY;
            this.personInfoEdit._setFormControl();
            this.personInfoEdit.form.patchValue(data);
            for (let key in data) {
                if (key.includes('_CN')) {
                    this.personInfoEdit.form[key] = data[key];
                }
            }
            const code = this.personInfoTabs.currentTableCode.split('_').pop();
            this.personInfoEdit.childId = data[`${this.tableHelper.getTableCode(code)}_ID`];
            this.personInfoEdit.open();
        },
        save: () => {
            const formData = this.personInfoEdit.form.getRawValue();
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                changeType: this.personInfoEdit.type,
                keyId: this.personTable.selectedPerson.DATA_3001_PERSON_A01_ID,
                tableId: this.personInfoTabs.currentTableCode,
                data: formData,
            };
            if (this.personInfoEdit.type === WfDataChangeTypeEnum.MODIFY) {
                params['childId'] = this.personInfoEdit.childId;
            }
            this.workflowService.saveChangeData(params).subscribe(val => {
                this.personTable._getPersonWfData(this.personInfoTabs.currentTableCode);
                this.personInfoEdit.close();
            });
        },
        /**
         * 编辑表单控制项
         */
        _setFormControl: () => {
            this.personInfoEdit.form = new FormGroup({});
            for (let item of this.personTable.tableHeader) {
                if (this.personInfoEdit.type === WfDataChangeTypeEnum.MODIFY) {
                    if (this.personInfoTabs.currentTableCode.includes('A05G')) {
                        if (['A05G24', 'A05G17'].includes(item.TABLE_COLUMN_CODE)) {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl(null)
                            );
                        } else {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl({ value: null, disabled: true })
                            );
                        }
                    } else if (this.personInfoTabs.currentTableCode.includes('A02')) {
                        if (['A0255', 'A0265', 'A0271'].includes(item.TABLE_COLUMN_CODE)) {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl(null)
                            );
                        } else {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl({ value: null, disabled: true })
                            );
                        }
                    } else if (this.personInfoTabs.currentTableCode.includes('A17')) {
                        if (['A1710G'].includes(item.TABLE_COLUMN_CODE)) {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl(null)
                            );
                        } else {
                            this.personInfoEdit.form.addControl(
                                item.TABLE_COLUMN_CODE,
                                new FormControl({ value: null, disabled: true })
                            );
                        }
                    } else if (this.personInfoTabs.currentTableCode.includes('A74')) {
                        this.personInfoEdit.form.addControl(
                            item.TABLE_COLUMN_CODE,
                            new FormControl(null)
                        );
                    }
                } else {
                    this.personInfoEdit.form.addControl(
                        item.TABLE_COLUMN_CODE,
                        new FormControl(null)
                    );
                }
            }
        },
    };

    /**
     * 选择职级
     */
    selectJob = {
        listOfSelectedValue: [],
        listOfSelectedData: [],
        listOfOption: [],
        save: () => {
            if (this.jobScheme.checkedList?.length <= 0) {
                return;
            }
            this.selectJob.listOfSelectedValue.forEach(item => {
                let data = this.selectJob.listOfOption.find(codeItem => codeItem.value === item);
                if (data) {
                    this.selectJob.listOfSelectedData.push(data);
                }
            });
            let list = [];
            this.selectJob.listOfSelectedValue.forEach(code => {
                let listItem = this.selectJob.listOfOption.find(item => item.value === code);
                list.push(listItem.text);
            });
            this.jobSchemeTabs.currentSchemeData.rankCode =
                this.selectJob.listOfSelectedValue.join(',');
            this.jobSchemeTabs.currentSchemeData.rankName = list.join(',');
            let param = {
                ...this.jobSchemeTabs.currentSchemeData,
            };
            delete param['B0601'];
            delete param[`${this.tableHelper.getTableCode('B06')}_ID`];
            delete param['checked'];
            this.service.updateScheme(param).subscribe(val => {});
        },
    };

    /**
     * 职数方案选择
     */
    jobScheme = {
        visible: false,
        width: 600,
        tableList: [],
        checkedList: [], // 确认的选中的方案列表
        currentSelect: [], // 暂时选中的方案列表
        pageIndex: 1,
        pageSize: 5,
        total: 0,
        checked: false,
        indeterminate: false,
        tableLoading: false,
        loading: false,
        close: () => {
            this.jobScheme.visible = false;
        },
        open: () => {
            this.jobScheme.currentSelect = [];
            this.jobScheme.checkedList.forEach(item => {
                this.jobScheme.currentSelect.push(item);
            });
            this.jobScheme._initChecked();
            this.jobScheme.visible = true;
        },
        onAllChecked: event => {
            if (event) {
                this.jobScheme.tableList = this.jobScheme.tableList.map(item => {
                    return {
                        ...item,
                        checked: true,
                    };
                });
                this.jobScheme.currentSelect = this.jobScheme.tableList;
            } else {
                this.jobScheme.tableList = this.jobScheme.tableList.map(item => {
                    return {
                        ...item,
                        checked: false,
                    };
                });
                this.jobScheme.currentSelect = [];
            }
        },
        onItemChecked: (data, event) => {
            if (event) {
                this.jobScheme.currentSelect.push(data);
            } else {
                const index = this.jobScheme.currentSelect.findIndex(
                    item =>
                        item[`${this.tableHelper.getTableCode('B06')}_ID`] ===
                        data[`${this.tableHelper.getTableCode('B06')}_ID`]
                );
                if (index >= 0) {
                    this.jobScheme.currentSelect.splice(index, 1);
                }
            }
            this.jobScheme._allCheckedStatus();
        },
        save: () => {
            // 所有选中的方案列表
            const list = this.jobScheme.currentSelect;
            // 找出已经保存的方案并替换
            list.forEach((item, index) => {
                let ind = this.jobScheme.checkedList.findIndex(
                    i =>
                        i[`${this.tableHelper.getTableCode('B06')}_ID`] ===
                        item[`${this.tableHelper.getTableCode('B06')}_ID`]
                );
                if (ind >= 0) {
                    list[index] = this.jobScheme.checkedList[ind];
                }
            });
            this.jobScheme.checkedList = [];
            const params = list.map(item => {
                return {
                    b0604: item.B0604 ? item.B0604 : item.b0604,
                    b0605: item.B0605 ? item.B0605 : item.b0605,
                    schemeId: item[`${this.tableHelper.getTableCode('B06')}_ID`],
                    schemeName: item.B0601,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    rankCode: item['rankCode'] ? item['rankCode'] : null,
                    rankName: item['rankName'] ? item['rankName'] : null,
                };
            });
            this.jobScheme.loading = true;
            if (params.length > 0) {
                this.service.saveScheme(params).subscribe(val => {
                    this.jobScheme.loading = false;
                    // this.jobScheme.checkedList = list;
                    this.jobScheme.checkedList = val.map(item => {
                        return {
                            ...item,
                            DATA_3001_UNIT_B06_ID: item.schemeId,
                            B0601: item.schemeName,
                            checked: true,
                        };
                    });
                    if (this.jobScheme.checkedList[0]) {
                        this.jobSchemeTabs.currentSchemeData = this.jobScheme.checkedList[0];
                        const rankCode = this.jobSchemeTabs.currentSchemeData.rankCode;
                        if (rankCode) {
                            const rankCodeList = rankCode.split(',');
                            this.selectJob.listOfSelectedValue = [...rankCodeList];
                        }
                        this.loadPersonTable();
                    }
                    this.jobScheme.close();
                });
            } else {
                this.service.deleteAll(this.jobStepInfo.jobId).subscribe(val => {
                    this.jobScheme.loading = false;
                    this.jobScheme.checkedList = [];
                    this.jobScheme.close();
                });
            }
        },
        pageIndexChange: () => {
            this.jobScheme.tableLoading = true;
            this._getJobSchemeByPageIndex();
            this.jobScheme.tableLoading = false;
            this.jobScheme._initChecked();
        },
        /**
         * 全选状态显示
         */
        _allCheckedStatus: () => {
            if (this.jobScheme.currentSelect.length === this.jobScheme.tableList.length) {
                this.jobScheme.checked = true;
                this.jobScheme.indeterminate = false;
            } else if (this.jobScheme.currentSelect.length > 0) {
                this.jobScheme.checked = false;
                this.jobScheme.indeterminate = true;
            } else {
                this.jobScheme.checked = false;
                this.jobScheme.indeterminate = false;
            }
        },
        /**
         * 初始化选中状态
         */
        _initChecked: () => {
            this.jobScheme.tableList = this.jobScheme.tableList.map(item => {
                return {
                    ...item,
                    checked: false,
                };
            });
            this.jobScheme.currentSelect.forEach(item => {
                let index = this.jobScheme.tableList.findIndex(
                    val =>
                        val[`${this.tableHelper.getTableCode('B06')}_ID`] ===
                        item[`${this.tableHelper.getTableCode('B06')}_ID`]
                );
                if (index >= 0) {
                    this.jobScheme.tableList[index].checked = true;
                }
            });
            this.jobScheme._allCheckedStatus();
        },
    };

    /**
     * 职数方案标签
     */
    jobSchemeTabs = {
        currentSchemeCodes: [],
        currentSchemeData: null,
        currentIndex: 0,
        tabsList: [],
        closeTab: event => {
            const index = event.index;
            this.jobScheme.checkedList.splice(index, 1);
            const params = this.jobScheme.checkedList.map(item => {
                return {
                    b0604: item.B0604 ? item.B0604 : item.b0604,
                    b0605: item.B0605 ? item.B0605 : item.b0605,
                    schemeId: item[`${this.tableHelper.getTableCode('B06')}_ID`],
                    schemeName: item.B0601,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    rankCode: item['rankCode'] ? item['rankCode'] : null,
                    rankName: item['rankName'] ? item['rankName'] : null,
                };
            });
            if (params.length > 0) {
                this.service.saveScheme(params).subscribe(val => {
                    this.jobScheme.checkedList = [...this.jobScheme.checkedList];
                });
            } else {
                this.service.deleteAll(this.jobStepInfo.jobId).subscribe(val => {
                    this.jobScheme.checkedList = [];
                });
            }
        },
        SelectedIndexChange: index => {
            this.selectJob.listOfSelectedValue = [];
            this.personTable.personList = [];
            const schemeData = this.jobScheme.checkedList[index];
            this.jobSchemeTabs.currentSchemeData = schemeData;
            if (!this.jobSchemeTabs.currentSchemeData) {
                return;
            }
            this._getJobSchemeCode(schemeData.B0604, schemeData.B0605);
            const rankCode = this.jobSchemeTabs.currentSchemeData.rankCode;
            if (rankCode) {
                const rankCodeList = rankCode.split(',');
                this.selectJob.listOfSelectedValue = [...rankCodeList];
            }
            this.loadPersonTable();
        },
        /**
         * 查看方案
         */
        show: {
            visible: false,
            width: 400,
            form: new FormGroup({
                B0601: new FormControl({ value: null, disabled: true }),
                B0604_CN: new FormControl({ value: null, disabled: true }),
                B0605_CN: new FormControl({ value: null, disabled: true }),
                maxNumber: new FormControl({ value: null, disabled: true }),
            }),
            close: () => {
                this.jobSchemeTabs.show.visible = false;
            },
            open: () => {
                let params = {};
                params[`${this.tableHelper.getTableCode('B06')}_ID`] =
                    this.jobSchemeTabs.currentSchemeData[
                        `${this.tableHelper.getTableCode('B06')}_ID`
                    ];
                this.service.getSchemeDataByID(params).subscribe(val => {
                    this.jobSchemeTabs.show.form.patchValue(val);
                    let maxNumber = 0;
                    this.jobSchemeTabs.currentSchemeCodes.forEach(code => {
                        maxNumber += parseInt(val[code]);
                    });
                    this.jobSchemeTabs.show.form.patchValue({ maxNumber });
                });
                this.jobSchemeTabs.show.visible = true;
            },
            _setFormValue: data => {},
        },
    };

    /**
     * 批量晋升
     */
    batchRise = {
        visible: false,
        title: '批量晋升',
        width: 640,
        systemSchemeEdit: [],
        loading: false,
        form: new FormGroup({}),
        open: () => {
            this.batchRise.visible = true;
        },
        close: () => {
            this.batchRise.visible = false;
        },
        save: () => {
            const list = this.personTable.personList.filter(row => !!row.check);
            if (list.length === 0) {
                this.message.warning('未选择办理人员。');
                return;
            }
            if (this.commonService.formVerify(this.batchRise.form)) {
                const params: any = {
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: `${this.tableHelper.getTableCode('A74')}`,
                    data: this.batchRise.form.getRawValue(),
                };
                const paramsArr = [];
                list.forEach(item => {
                    let oldData = null;
                    if (this.personInfoTabs.A74TablelData) {
                        oldData = this.personInfoTabs.A74TablelData.find(
                            data =>
                                data[`${this.tableHelper.getTableCode('A74')}_A01_ID`] ===
                                item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                    }
                    if (oldData) {
                        paramsArr.push({
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobDataId: this.jobStepInfo.jobDataId,
                            changeType: WfDataChangeTypeEnum.MODIFY,
                            tableId: `${this.tableHelper.getTableCode('A74')}`,
                            data: this.batchRise.form.getRawValue(),
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                            childId: oldData[`${this.tableHelper.getTableCode('A74')}_ID`],
                        });
                    } else {
                        paramsArr.push({
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobDataId: this.jobStepInfo.jobDataId,
                            changeType: WfDataChangeTypeEnum.ADD,
                            tableId: `${this.tableHelper.getTableCode('A74')}`,
                            data: this.batchRise.form.getRawValue(),
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        });
                    }
                });
                this.batchRise.loading = true;
                this.workflowService.saveMultipleTableData(paramsArr).subscribe(() => {
                    this.batchRise.loading = false;
                    this.batchRise.close();
                    this.personTable._getPersonWfData(null);
                });
            }
        },
        find: {
            // 搜索框
            searchWidth: 200,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    this.batchRise.find.selectedIndex = -1;
                    return;
                }
                // 查找位置
                this.batchRise.find.selectedIndex = this.personTable.personList.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );

                this.scrolleditAllElement.scrollToIndex(this.batchRise.find.selectedIndex);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.batchRise.find.list = this.personTable.personList
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },
        _setFormControl: () => {
            this.batchRise.systemSchemeEdit.forEach(item => {
                this.batchRise.form.addControl(item.TABLE_COLUMN_CODE, new FormControl(null));
            });
        },
    };

    /**
     * 查看人员表
     */
    viwePersonExcelIfy = {
        title: '人员信息',
        visible: false,
        width: 880,
        close: () => {
            this.viwePersonExcelIfy.visible = false;
        },
        open: () => {
            this.viwePersonExcelIfy._setParams();
            this.viwePersonExcelIfy.visible = true;
        },
        row: null,
        permission: 'wage_change_table001',
        params: null,
        _setParams: () => {
            const { jobId, jobStepId } = this.jobStepInfo;
            // const { DATA_PERSON_A01_ID } = this.viwePersonExcelIfy.row;
            this.viwePersonExcelIfy.params = {
                jobId,
                jobStepId,
                // DATA_PERSON_A01_ID,
            };
            this.viwePersonExcelIfy.params[`${this.tableHelper.getTableCode('A01')}_ID`] =
                this.viwePersonExcelIfy.row[`${this.tableHelper.getTableCode('A01')}_ID`];
        },
    };

    @ViewChild('salaryGZ07Element', { static: false }) salaryGZ07Element: SalaryGz07DrawerComponent;

    /**
     * 数据校验内容显示
     */
    dataVerificationIfy = {
        visible: false,
        width: 500,
        close: () => {
            this.dataVerificationIfy.visible = false;
        },
        open: () => {
            this.dataVerificationIfy.visible = true;
        },

        list: [],
    };

    @ViewChild('cameraCZURElement') cameraCZURElement: CameraCZURComponent;
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *上传附件
     */
    uploaddrawerify = {
        visible: false,
        width: 400,
        currentPerson: null,
        selectIndex: -1,
        open: (data, i) => {
            this.uploaddrawerify.currentPerson = data;
            this.uploaddrawerify.selectIndex = i;
            this.uploaddrawerify.visible = true;
            this.uploaddrawerify.uploadIfy.getPersonFileList(data);
        },
        close: () => {
            this.personInfoTabs.currentIndex = 0;
            this.uploaddrawerify.visible = false;
        },
        camera: () => {
            this.cameraCZURElement.show();
        },
        takedChange: event => {
            this.commonService.fileUpload(event).subscribe(result => {
                result.filePath = `${this.commonService.getOpenFileURL(
                    result.fileId,
                    result.fileName
                )}`;
                this.uploaddrawerify.uploadIfy.savePersonAnnex(result);
            });
        },
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
                const formData = new FormData();
                formData.append('file', item.file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    result.filePath = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    this.uploaddrawerify.uploadIfy.savePersonAnnex(result);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: file => {
                const index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.deletePersonFile(
                    this.uploaddrawerify.uploadIfy.list[index]
                );
                this.uploaddrawerify.uploadIfy.list.splice(index, 1);
                this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                return true;
            },
            preview: file => {
                const index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.selectedIndex = index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            /**
             * 保存人员附件
             */
            savePersonAnnex: file => {
                const params = {
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.uploaddrawerify.currentPerson[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                    ...file,
                };

                this.workflowService.savePersonAnnex(params).subscribe(result => {
                    // 文件类型缩略图
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    // 文件URL
                    let url = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    this.uploaddrawerify.uploadIfy.list.push({
                        ...result,
                        url,
                        thumbUrl,
                        name: file.fileName,
                    });
                    this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                });
            },
            /**
             * 查询人员附件
             */
            getPersonFileList: event => {
                const data = {
                    keyId: event[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                };
                this.workflowService.getPersonFileList(data).subscribe(result => {
                    this.uploaddrawerify.uploadIfy.list = result.map(file => {
                        const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                            file.fileType
                        );
                        return {
                            ...file,
                            name: file.fileName,
                            url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                            thumbUrl,
                        };
                    });
                });
            },
            /**
             * 删除附件--数据库删除
             */
            deletePersonFile: data => {
                this.workflowService.deletePersonFile(data.id).subscribe();
            },
            list: [],
        },
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetLevelRiseService
    ) {}

    async ngOnInit() {
        this.service.getSchemeByPermission('jobRiseInfo').subscribe(val => {
            this.personInfoTabs.tabsList = val.systemSchemeList.map(item => {
                return {
                    text: item.systemSchemeTable.SCHEME_TABLE_DISPLAY_NAME,
                    TABLE_CODE: item.systemSchemeTable.TABLE_CODE,
                };
            });
            this.personTable.tableHeader = val.systemSchemeList[0].systemSchemeHeader;
            this.personTable.systemSchemeList = val.systemSchemeList;
            this.personInfoTabs.tabsList.push({ text: '附件信息', TABLE_CODE: '' });
            this.personInfoTabs.tabsList = [...this.personInfoTabs.tabsList];
            this.personInfoTabs.currentTableCode = this.personInfoTabs.tabsList[0]?.TABLE_CODE;
        });
        // 批量晋升界面方案
        this.service.getSchemeByPermission('batchRise').subscribe(val => {
            const systemSchemeEdit = val.systemSchemeList[0].systemSchemeEdit;
            this.batchRise.systemSchemeEdit = systemSchemeEdit;
            this.batchRise._setFormControl();
            console.log(systemSchemeEdit);
        });
        // 获取职数方案
        const userInfo: any = await this.commonService.getUserInfoByCache();
        if (userInfo) {
            const param = {
                DATA_3001_UNIT_B06_B01_ID: userInfo.B01_ID,
                $PAGE_SIZE$: 5,
                $PAGE_INDEX$: 1,
            };
            const jobSchemeList = await this._getJobScheme(param);
            if (this.jobScheme.pageIndex === 1) {
                this.jobScheme.total = jobSchemeList.totalCount;
            }
            this.jobScheme.tableList = jobSchemeList.result.map(item => {
                return {
                    ...item,
                    checked: false,
                };
            });
        }
    }

    ngAfterViewInit() {}

    /**
     * 获取方案代码
     */
    private _getJobSchemeCode(B0604, B0605) {
        let scheme = 'job_management_01';
        if (B0604 === '0101' && B0605 === '01') {
            scheme = 'job_management_01';
        } else if (B0604 === '0102' && B0605 === '01') {
            scheme = 'job_management_02';
        } else if (B0604 === '0103' && B0605 === '01') {
            scheme = 'job_management_03';
        } else if (B0604 === '0104' && B0605 === '01') {
            scheme = 'job_management_04';
        } else if (B0604 === '0105' && B0605 === '01') {
            scheme = 'job_management_05';
        } else if (B0604 === '0106' && B0605 === '01') {
            scheme = 'job_management_06';
        } else if (B0604 === '0107' && B0605 === '01') {
            scheme = 'job_management_07';
        } else if (B0604 === '0108' && B0605 === '01') {
            scheme = 'job_management_08';
        } else if (B0604 === '0109' && B0605 === '01') {
            scheme = 'job_management_09';
        } else if (B0604 === '0110' && B0605 === '01') {
            scheme = 'job_management_10';
        } else if (B0604 === '0201' && B0605 === '02') {
            scheme = 'job_management_11';
        } else if (B0604 === '0202' && B0605 === '02') {
            scheme = 'job_management_12';
        } else if (B0604 === '0203' && B0605 === '02') {
            scheme = 'job_management_13';
        } else if (B0604 === '0301' && B0605 === '03') {
            scheme = 'job_management_14';
        } else if (B0604 === '0302' && B0605 === '03') {
            scheme = 'job_management_15';
        } else if (B0604 === '0303' && B0605 === '03') {
            scheme = 'job_management_16';
        }
        this.service.getSchemeByPermission(scheme).subscribe(val => {
            if (val.systemSchemeList[0]?.systemSchemeEdit) {
                const list = val.systemSchemeList[0].systemSchemeEdit.map(
                    item => item.TABLE_COLUMN_CODE
                );
                this.jobSchemeTabs.currentSchemeCodes = list;
                let codeMap = new Map();
                this.JOB_SCHEME.forEach(item => {
                    for (let value of list) {
                        if (item.field === value) {
                            item.level.forEach(code => {
                                codeMap.set(code, code);
                            });
                        }
                    }
                });
                const codes = [];
                codeMap.forEach(val => {
                    codes.push(val);
                });
                this.service.getCodeList().subscribe(val => {
                    let codesList = [];
                    for (let i = 0; i <= val.length; i++) {
                        let ind = codes.findIndex(code => code === val[i].DICTIONARY_ITEM_CODE);
                        if (ind >= 0) {
                            codesList.push(val[i]);
                        }
                        if (codesList.length >= codes.length) {
                            break;
                        }
                    }
                    this.selectJob.listOfOption = codesList;
                    this.selectJob.listOfSelectedData = [];
                    this.selectJob.listOfSelectedValue.forEach(item => {
                        let data = this.selectJob.listOfOption.find(
                            codeItem => codeItem.value === item
                        );
                        if (data) {
                            this.selectJob.listOfSelectedData.push(data);
                        }
                    });
                });
            }
        });
    }

    /**
     * 获取当前页职数方案
     */
    private async _getJobSchemeByPageIndex() {
        const userInfo: any = await this.commonService.getUserInfoByCache();
        const param = {
            DATA_3001_UNIT_B06_B01_ID: userInfo.B01_ID,
            $PAGE_SIZE$: this.jobScheme.pageSize,
            $PAGE_INDEX$: this.jobScheme.pageIndex,
        };
        const jobSchemeList = await this._getJobScheme(param);
        if (this.jobScheme.pageIndex === 1) {
            this.jobScheme.total = jobSchemeList.totalCount;
        }
        this.jobScheme.tableList = jobSchemeList.result.map(item => {
            return {
                ...item,
                checked: false,
            };
        });
        this.jobScheme._initChecked();
    }

    /**
     * 加载页面职数方案
     */
    loadJobScheme() {
        this.service.getWfScheme(this.jobStepInfo.jobId).subscribe(val => {
            this.jobScheme.checkedList = val.map(item => {
                return {
                    ...item,
                    DATA_3001_UNIT_B06_ID: item.schemeId,
                    B0601: item.schemeName,
                    checked: true,
                };
            });
            if (this.jobScheme.checkedList[0]) {
                this.jobSchemeTabs.currentSchemeData = this.jobScheme.checkedList[0];
                const rankCode = this.jobSchemeTabs.currentSchemeData.rankCode;
                if (rankCode) {
                    const rankCodeList = rankCode.split(',');
                    this.selectJob.listOfSelectedValue = [...rankCodeList];
                }
                this.loadPersonTable();
            }
        });
    }

    /**
     * 获取方案下的人员
     */
    private loadPersonTable() {
        if (!this.jobSchemeTabs.currentSchemeData?.DATA_3001_UNIT_B06_ID) {
            return;
        }
        this.service
            .getPersonByScheme({
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                schemeId: this.jobSchemeTabs.currentSchemeData.DATA_3001_UNIT_B06_ID,
            })
            .subscribe(val => {
                this.personTable.personList = val.map(item => {
                    return {
                        ...item,
                        text: item.A0101,
                    };
                });
                this.personSelectIfy.psnDataChange(val);
            });
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        this.workflowService.getWfListData(data).subscribe(result => {
            this.personSelectIfy.psnDataChange(result);
        });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }

    /**
     * 获取职数方案
     */
    private _getJobScheme(data) {
        return this.service.getOptionList(data).toPromise();
    }
}
