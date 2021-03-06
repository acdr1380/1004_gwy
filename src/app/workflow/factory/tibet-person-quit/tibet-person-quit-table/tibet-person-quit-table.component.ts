import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { Base64 } from 'js-base64';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { A30 } from './field_scheme/A30';
import { A31 } from './field_scheme/A31';
import { A75 } from './field_scheme/A75';
import { TibetPersonQuitService } from '../tibet-person-quit.service';

declare global {
    interface Window {
        /**
         * 个人工资信息详细窗口
         */
        winOperSalaryInfoDlg: any;
    }
}

@Component({
    selector: 'gl-tibet-person-quit-table',
    templateUrl: './tibet-person-quit-table.component.html',
    styleUrls: ['./tibet-person-quit-table.component.scss'],
})
export class TibetPersonQuitTableComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;

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
            this.loadPersonTable(0);
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    // 标签页内容为A3001字段的代码项
    tabSetA3001Ify = {
        tabIndex: 0,
        tabList: [
            { name: '待办人员', count: 0, codeValue: '-1' },
            { name: '退休', count: 0, codeValue: '1' },
            { name: '调出', count: 0, codeValue: '2' },
            { name: '死亡', count: 0, codeValue: '3' },
            { name: '辞职', count: 0, codeValue: '4' },
            { name: '转出', count: 0, codeValue: '8' },
            { name: '其他', count: 0, codeValue: '9' },
        ],
        indexChange: index => {
            const tab = this.tabSetA3001Ify.tabList[index];
            // 切换选项卡，过滤出与选项卡代码值对应的人员数据
            let item;
            tab.codeValue === '-1'
                ? (item = this.personTableIfy.originalPersonData.find(
                      v => v.value === tab.codeValue
                  ))
                : (item = this.personTableIfy.originalPersonData.find(
                      v => v.value.substring(0, 1) === tab.codeValue
                  ));
            if (item && tab.codeValue === '-1') {
                this.personTableIfy.data = item.tableData.filter(d => !d.A3001);
                tab.count = this.personTableIfy.data.length;
            } else if (!item) {
                this.personTableIfy.data = [];
            } else {
                this.personTableIfy.data = item.tableData;
            }
        },
        _initTabListCount: () => {
            if (this.personTableIfy.originalPersonData.length > 0) {
                // 标签页count参数赋值
                this.tabSetA3001Ify.tabList
                    .filter(v => v.codeValue !== '-1')
                    .forEach(t => {
                        let ele;
                        ele = this.personTableIfy.originalPersonData.find(
                            v => v.value.substring(0, 1) === t.codeValue
                        );
                        ele ? (t.count = ele.count) : (t.count = 0);
                    });
            }
        },
    };

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;
    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;
    /**
     * 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
        },
        evtSelectPerson: () => {
            this.operSelectPerson.show();
        },
        isChange: null,
        evtChange: () => {
            this.loadPersonTable(0);
        },
        psnDataChange: () => {
            if (this.personTableIfy.originalPersonData.length > 0) {
                // 人员禁选列表
                const item = this.personTableIfy.originalPersonData.find(d => d.value === '-1');
                return item.tableData.map(p => p[`${this.tableHelper.getTableCode('A01')}_ID`]);
            } else {
                return [];
            }
        },
        // 批量编辑
        batchEdit: () => {
            this.causeChangeEditAllIfy.open();
        },
    };

    @ViewChild('scrolleditAllElement', { static: false })
    scrolleditAllElement: CdkVirtualScrollViewport;
    /**
     * 批量编辑字段抽屉
     */
    causeChangeEditAllIfy = {
        batchEdit: false,
        title: '批量办理',
        visible: false,
        width: 620,
        formData: {},
        close: () => {
            this.causeChangeEditAllIfy.batchEdit = false;
            this.causeChangeEditAllIfy.visible = false;
        },
        open: () => {
            this.causeChangeEditAllIfy.batchEdit = true;
            this.causeChangeEditAllIfy.fields = [];
            this.causeChangeEditAllIfy._loadEditFields();
            this.causeChangeEditAllIfy.visible = true;
        },
        // 批量编辑
        _loadEditFields: async () => {
            // 人员列表选中状态初始化
            this.personTableIfy.data.forEach(d => (d.check = false));
            // 字段数据赋值，构造表单
            // this.causeChangeEditAllIfy.fields = [].concat(A30);
            // this.causeChangeEditAllIfy.form = this.causeChangeEditIfy._buildFieldsForm(this.causeChangeEditAllIfy.fields);
            // this.causeChangeEditAllIfy.formData = {};
            // this.causeChangeEditAllIfy.form.reset();
        },
        fields: [],
        form: new FormGroup({}),
        evtGetTempOutParams: () => {
            return {
                formGroup: this.causeChangeEditAllIfy.form,
                fields: this.causeChangeEditAllIfy.fields,
                inline: false,
                formData: {},
            };
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
                    this.causeChangeEditAllIfy.find.selectedIndex = -1;
                    return;
                }
                // 查找位置
                this.causeChangeEditAllIfy.find.selectedIndex = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );

                this.scrolleditAllElement.scrollToIndex(
                    this.causeChangeEditAllIfy.find.selectedIndex
                );
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.causeChangeEditAllIfy.find.list = this.personTableIfy.data
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },
        loading: false,
        save: () => {
            const list = this.personTableIfy.data.filter(row => !!row.check);
            if (list.length === 0) {
                this.message.warning('未选择办理人员。');
                return;
            }
            if (this.commonService.formVerify(this.causeChangeEditAllIfy.form)) {
            }
        },
    };

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

    /**
     * 人员表格
     */
    personTableIfy = {
        find: {
            // 搜索框
            searchWidth: 260,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    this.personTableIfy.selectedRowIndex = -1;
                    return;
                }
                const { pageSize } = this.personTableIfy;
                // 查找位置
                const location = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );
                // 计算位置所在页
                // tslint:disable-next-line:no-bitwise
                this.personTableIfy.pageIndex = ~~(location / pageSize) + 1;

                // 定位选中
                this.personTableIfy.selectedRowIndex = location % pageSize;
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personTableIfy.find.list = this.personTableIfy.data
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },

        // 表格总数据
        originalPersonData: [],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        loading: false,
        data: [],
        selectedRowIndex: -1,
        /**
         * 撤选人员
         */
        evtDeletePerson: (event, row) => {
            if (!this.canEdit) {
                return;
            }
            event.stopPropagation();
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [row[`${this.tableHelper.getTableCode('A01')}_ID`]],
                    };
                    this.workflowService
                        .deletePerson(this.jobStepInfo.wfId, data)
                        .subscribe(result => {
                            const index = this.personTableIfy.data.findIndex(
                                v =>
                                    v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                    row[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            this.personTableIfy.data.splice(index, 1);
                            this.personTableIfy.data = [...this.personTableIfy.data];

                            this.tabSetA3001Ify.tabList[this.tabSetA3001Ify.tabIndex].count -= 1;

                            // 删除撤选人员的禁用状态
                            const index2 = this.personTableIfy.originalPersonData.findIndex(
                                v =>
                                    v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                    row[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            this.personTableIfy.originalPersonData.splice(index2, 1);
                            this.personTableIfy.originalPersonData = [
                                ...this.personTableIfy.originalPersonData,
                            ];
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        loadSalaryInfo: row => {
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

            window.winOperSalaryInfoDlg = window.open(url, 'salary-Info');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
            // this.router.navigate(['irregularity/oper-salary-info-page', { GL }]);
        },
        // 编辑
        causeChange: (event, row) => {
            if (!this.canEdit) {
                return;
            }
            this.causeChangeEditIfy.row = row;
            this.causeChangeEditIfy.open();
        },
    };

    /**
     * 单条编辑字段抽屉
     */
    causeChangeEditIfy = {
        title: '信息修改',
        visible: false,
        width: 500,
        close: () => (this.causeChangeEditIfy.visible = false),
        open: () => {
            this.causeChangeEditIfy.fields = [];
            this.causeChangeEditIfy._loadEditFields();
            this.causeChangeEditIfy.visible = true;
        },
        a30Fields: A30,
        fieldsA31: A31,
        a75Fields: A75,
        _loadEditFields: async () => {
            if (this.tabSetA3001Ify.tabList[this.tabSetA3001Ify.tabIndex].codeValue !== '-1') {
                // 显示字段赋初值
                this.causeChangeEditIfy.fields = [].concat(A30);
                this.causeChangeEditIfy.form = this.causeChangeEditIfy._buildFieldsForm(
                    this.causeChangeEditIfy.fields
                );
                // 当前标签页codeValue拥有代码值时，初始化编辑显示字段
                this.causeChangeEditIfy._buildFormData();
            } else {
                // 待办理页面抽屉编辑字段时
                let psnData;
                psnData = this.personTableIfy.originalPersonData
                    .find(v => v.value === '-1')
                    .tableData.find(
                        y =>
                            y[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            this.causeChangeEditIfy.row[
                                `${this.tableHelper.getTableCode('A01')}_ID`
                            ]
                    );
                // 显示字段赋初值
                this.causeChangeEditIfy.fields = [].concat(A30);
                // 构造form表单
                this.causeChangeEditIfy.form = this.causeChangeEditIfy._buildFieldsForm(
                    this.causeChangeEditIfy.fields
                );
                // 表单赋值
                this.causeChangeEditIfy.data = psnData;
                this.causeChangeEditIfy.form.reset(psnData);
            }
        },
        fields: [],
        form: new FormGroup({}),
        evtGetTempOutParams: () => {
            return {
                formGroup: this.causeChangeEditIfy.form,
                fields: this.causeChangeEditIfy.fields,
                inline: false,
                formData: this.causeChangeEditIfy.data,
            };
        },
        /**
         * 当前选中表格数据行
         */
        row: null,
        data: null,
        loading: false,
        save: () => {
            if (this.commonService.formVerify(this.causeChangeEditIfy.form)) {
                // 取参数
                const params = this.causeChangeEditIfy._getChildSaveParams();
                this.workflowService.saveMultipleTableData(params).subscribe(() => {
                    // 表格数据刷新
                    this.loadPersonTable(this.tabSetA3001Ify.tabIndex);
                    this.causeChangeEditIfy.close();
                });
            }
        },
        // 构造A30，A31，A75子集参数
        _getChildSaveParams: () => {
            const keyId = this.causeChangeEditIfy.row[`${this.tableHelper.getTableCode('A01')}_ID`];
            const row = this.personTableIfy.originalPersonData
                .find(v => v.value === '-1')
                .tableData.find(d => d[`${this.tableHelper.getTableCode('A01')}_ID`] === keyId);
            const formValue = this.causeChangeEditIfy.form.value;
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const a30Data = {};
            this.causeChangeEditIfy.fields.forEach(v => {
                a30Data[v.TABLE_COLUMN_CODE] = formValue[v.TABLE_COLUMN_CODE];
            });
            let paramsArr = [
                {
                    childId: row[`${this.tableHelper.getTableCode('A30')}_ID`],
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: `${this.tableHelper.getTableCode('A30')}`,
                    data: a30Data,
                },
            ];
            if (this.causeChangeEditIfy.fields.find(f => f.TABLE_COLUMN_CODE === 'A3107')) {
                // 编辑表单中存在A31字段时
                const a31Data = {};
                A31.forEach(v => {
                    a31Data[v.TABLE_COLUMN_CODE] = formValue[v.TABLE_COLUMN_CODE];
                });
                paramsArr.push({
                    childId: row[`${this.tableHelper.getTableCode('A31')}_ID`]
                        ? row[`${this.tableHelper.getTableCode('A31')}_ID`]
                        : '-1',
                    changeType: row[`${this.tableHelper.getTableCode('A31')}_ID`]
                        ? WfDataChangeTypeEnum.MODIFY
                        : WfDataChangeTypeEnum.ADD,
                    tableId: `${this.tableHelper.getTableCode('A31')}`,
                    data: a31Data,
                });
            }
            if (this.causeChangeEditIfy.fields.find(f => f.TABLE_COLUMN_CODE === 'A7501')) {
                // 编辑表单中存在A75字段时
                const a75Data = {};
                A75.forEach(v => {
                    a75Data[v.TABLE_COLUMN_CODE] = formValue[v.TABLE_COLUMN_CODE];
                });
                paramsArr.push({
                    childId: row[`${this.tableHelper.getTableCode('A75')}_ID`]
                        ? row[`${this.tableHelper.getTableCode('A75')}_ID`]
                        : '-1',
                    changeType: row[`${this.tableHelper.getTableCode('A75')}_ID`]
                        ? WfDataChangeTypeEnum.MODIFY
                        : WfDataChangeTypeEnum.ADD,
                    tableId: this.tableHelper.getTableCode('A75'),
                    data: a75Data,
                });
            }
            paramsArr = paramsArr.map(d => {
                d['keyId'] = keyId;
                d['jobId'] = jobId;
                d['jobDataId'] = jobDataId;
                d['jobStepId'] = jobStepId;
                return { ...d };
            });
            return paramsArr;
        },
        _buildFieldsForm: fields => {
            let form = new FormGroup({});
            fields.forEach(v => {
                form.addControl(
                    v.TABLE_COLUMN_CODE,
                    new FormControl(
                        { value: null, disabled: false },
                        [v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null].filter(s => s)
                    )
                );
            });
            return form;
        },
        _removeFieldsFormControl: (form, fields) => {
            fields.forEach(v => {
                form.removeControl(v.TABLE_COLUMN_CODE);
            });
        },
        _addFieldsFormControl: (form, fields) => {
            fields.forEach(v => {
                form.addControl(
                    v.TABLE_COLUMN_CODE,
                    new FormControl({ value: null, disabled: false })
                );
            });
        },
        _buildFormData: () => {
            let psnData;
            psnData = this.personTableIfy.originalPersonData
                .find(v => v.value === '-1')
                .tableData.find(
                    y =>
                        y[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                        this.causeChangeEditIfy.row[`${this.tableHelper.getTableCode('A01')}_ID`]
                );

            // 根据条件对A31，A75字段的增删
            this.causeChangeEditIfy._operatingA31AndA75Fields(psnData, 'A3001', 'A31');
            this.causeChangeEditIfy._operatingA31AndA75Fields(psnData, 'A7514', 'A75');
            // 加载表单数据，为字段赋值
            this.causeChangeEditIfy.data = psnData;
            this.causeChangeEditIfy.form.reset(psnData);
        },
        // 代码框的回调
        inputCodeChange: (value, field) => {
            // 当A3001 like 1% 时，增加显示A31的指标项目
            // 当交流标识A7514为 是 时，增加显示A75的指标
            // 以上规则同样运用于每次打开编辑抽屉时的表单赋值
            const { TABLE_COLUMN_CODE } = field;
            switch (TABLE_COLUMN_CODE) {
                case 'A3001':
                    this.causeChangeEditIfy._operatingA31AndA75Fields(
                        { A3001: value },
                        'A3001',
                        'A31'
                    );
                    break;
                case 'A7514':
                    this.causeChangeEditIfy._operatingA31AndA75Fields(
                        { A7514: value },
                        'A7514',
                        'A75'
                    );
                    break;
            }
        },
        // 打开编辑抽屉时根据下列规则操作A31，A75子集字段的显示
        // 当A3001 like 1% 时，增加显示A31的指标项目
        // 当交流标识A7514为 是（'1'） 时，增加显示A75的指标
        _operatingA31AndA75Fields: (value, field, child) => {
            if (!value[field]) {
                return;
            }
            let form;
            // 是否批量编辑
            this.causeChangeEditAllIfy.batchEdit
                ? (form = this.causeChangeEditAllIfy.form)
                : (form = this.causeChangeEditIfy.form);
            if (value[field].substring(0, 1) === '1') {
                let extraFieldsArr;
                if (child === 'A31') {
                    extraFieldsArr = [].concat(this.causeChangeEditIfy.fieldsA31);
                    this.causeChangeEditIfy.fields.push(...this.causeChangeEditIfy.fieldsA31);
                } else {
                    extraFieldsArr = [].concat(this.causeChangeEditIfy.a75Fields);
                    this.causeChangeEditIfy.fields.push(...this.causeChangeEditIfy.a75Fields);
                }
                // 去重
                const set = new Set(this.causeChangeEditIfy.fields);
                this.causeChangeEditIfy.fields = [...set];
                this.causeChangeEditIfy._addFieldsFormControl(form, extraFieldsArr);
            } else {
                if (child === 'A31') {
                    // 判断是否存在A31子集字段
                    const statusA31 = this.causeChangeEditIfy.fields.some(f =>
                        f.TABLE_COLUMN_CODE.includes(child)
                    );
                    if (statusA31) {
                        // 存在则删除，并清除对应字段表单
                        this.causeChangeEditIfy.fields = this.causeChangeEditIfy.fields.filter(
                            v => !v.TABLE_COLUMN_CODE.includes(child)
                        );
                        this.causeChangeEditIfy._removeFieldsFormControl(form, A31);
                    }
                } else {
                    // 判断是否存在A75子集字段
                    const statusA75 = this.causeChangeEditIfy.fields
                        .filter(f => f.TABLE_COLUMN_CODE !== 'A7514')
                        .some(f => f.TABLE_COLUMN_CODE.includes(child));
                    if (statusA75) {
                        // 存在则删除，并清除对应字段表单
                        // 保留A7514字段
                        this.causeChangeEditIfy.fields = this.causeChangeEditIfy.fields.filter(
                            f =>
                                !f.TABLE_COLUMN_CODE.includes(child) ||
                                f.TABLE_COLUMN_CODE === 'A7514'
                        );
                        this.causeChangeEditIfy._removeFieldsFormControl(form, A75);
                    }
                }
            }
        },
    };

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
        close: () => (this.uploaddrawerify.visible = false),
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
                const formData = new FormData();
                formData.append('file', item.file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    result.url = result.filePath = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    const fileObj = Object.assign(item.file, result);
                    fileObj.operFiles = result;
                    this.uploaddrawerify.uploadIfy.savePersonAnnex(fileObj);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.deletePersonFile(
                    this.uploaddrawerify.uploadIfy.list[_index]
                );
                this.uploaddrawerify.uploadIfy.list.splice(_index, 1);
                this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount -= 1;
                this.personTableIfy.data = [...this.personTableIfy.data];
                return true;
            },
            preview: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            /**
             * 保存人员附件
             */
            savePersonAnnex: file => {
                const params = Object.assign(file.operFiles, {
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.uploaddrawerify.currentPerson[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                });

                this.workflowService.savePersonAnnex(params).subscribe(() => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    this.uploaddrawerify.uploadIfy.list.push({
                        thumbUrl,
                        ...file,
                        name: file.fileName,
                    });
                    this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                    this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount += 1;
                    this.personTableIfy.data = [...this.personTableIfy.data];
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
                            operFiles: file,
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
                this.workflowService.deletePersonFile(data.operFiles.id).subscribe();
            },
            list: [],
        },
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private router: Router,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetPersonQuitService
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {}

    // 表格取数
    private async loadPersonTable(index) {
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        const result = await this.service.getWfListData(data).toPromise();
        this.personTableIfy.originalPersonData = [];
        if (result.length > 0) {
            this.personTableIfy.originalPersonData = result;
            this.loadA31AndA75Child();
            this.tabSetA3001Ify._initTabListCount();
            this.tabSetA3001Ify.indexChange(index);
        }
    }

    /**
     * A31,A75子集取数
     */
    private async loadA31AndA75Child() {
        const param = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            childFields: {
                [this.tableHelper.getTableCode('A31')]: [],
                [this.tableHelper.getTableCode('A75')]: [],
                [this.tableHelper.getTableCode('A30')]: [],
            },
        };
        const result = await this.workflowService.getPsnList(this.service.wfId, param).toPromise();
        // 将A30，A31，A75子集数据挂到表格数据上
        this.buildPsnTableOriginalData('A30', result[`${this.tableHelper.getTableCode('A30')}`]);
        if (result[`${this.tableHelper.getTableCode('A31')}`]) {
            this.buildPsnTableOriginalData(
                'A31',
                result[`${this.tableHelper.getTableCode('A31')}`]
            );
        }
        if (result[`${this.tableHelper.getTableCode('A75')}`]) {
            this.buildPsnTableOriginalData(
                'A75',
                result[`${this.tableHelper.getTableCode('A75')}`]
            );
        }
    }

    // 将子集数据挂进表格数据中
    private buildPsnTableOriginalData(tableName, result) {
        const index = this.personTableIfy.originalPersonData.findIndex(x => x.value === '-1');
        this.personTableIfy.originalPersonData[index].tableData.map(y => {
            const a = result.find(
                m =>
                    m.changeState === 0 &&
                    m.IS_LAST_ROW &&
                    m[`${this.tableHelper.getTableCode(tableName)}_A01_ID`] ===
                        y[`${this.tableHelper.getTableCode('A01')}_ID`]
            );
            y = Object.assign(y, a);
            return { ...y };
        });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
