import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SalaryCalculateService } from './salary-calculate.service';
import { CommonService } from 'app/util/common.service';
import { differenceInCalendarDays } from 'date-fns';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { DbTypeEnum } from 'app/workflow/enums/DbTypeEnum';
import * as Mock from 'mockjs';

@Component({
    selector: 'gl-salary-calculate',
    templateUrl: './salary-calculate.component.html',
    styleUrls: ['./salary-calculate.component.scss'],
})
export class SalaryCalculateComponent implements OnInit {
    constructor(
        private service: SalaryCalculateService,
        private modal: NzModalService,
        private commonService: CommonService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper,
        private workflowService: WorkflowService
    ) {}

    ngOnInit() {
        /**
         * 获取工改后信息表头
         */
        this.service.getSchemeByPermission('jobChangeAfter').subscribe(val => {
            this.jobChangeAfterTabel.tableHeader = val.systemSchemeList.map(
                item => item.systemSchemeHeader
            );
        });
        // 获取业务初始数据
        this.isLoading = true;
        this.service.selectByWfId().subscribe(val => {
            if (val.length > 0) {
                this._selectStepInfo(val[0]);
            } else {
                const data = {
                    wfId: this.service.wfId,
                    wfParamMain: {
                        title: this.service.wfName,
                        contacts: this.userInfo.SYSTEM_USER_NAME,
                        contactNumber: this.userInfo.SYSTEM_USER_PHONE,
                    },
                };
                this.service.start(data).subscribe(val => {
                    this._selectStepInfo(val);
                });
            }
        });
        if (this.isChangeBefor) {
            this.jobChanging._subscript();
        }
    }

    columnType = ColumnTypeEnum;

    /**
     * 是否是套改前
     */
    isChangeBefor = true;
    /**
     * 用户参数
     */
    userInfo = this.commonService.getUserLoginInfo();
    /**
     * 业务信息
     */
    wfInfo;
    /**
     * 业务数据
     */
    wfDate = {};
    /**
     * 单个人员业务数据
     */
    personWfData = {
        DATA_3001_PERSON_A01: [],
        DATA_1002_PERSON_GZ01: [],
        DATA_1002_PERSON_GZ02: [],
        DATA_1002_PERSON_GZ06: [],
        DATA_1002_PERSON_GZ09: [],
        DATA_1002_PERSON_GZ42: [],
        DATA_1002_PERSON_GZA01: [],
    };
    /**
     * 选择人员信息
     */
    selectPersonInfo = {
        jobInfo: [],
        salaryInfo: [],
        eduInfo: {},
        gapInfo: [],
    };
    /**
     * 清空选择人员信息
     */
    clearSelectPersonInfo = () => {
        this.selectPersonInfo = {
            jobInfo: [],
            salaryInfo: [],
            eduInfo: [],
            gapInfo: [],
        };
        this.personWfData = {
            DATA_3001_PERSON_A01: [],
            DATA_1002_PERSON_GZ01: [],
            DATA_1002_PERSON_GZ02: [],
            DATA_1002_PERSON_GZ06: [],
            DATA_1002_PERSON_GZ09: [],
            DATA_1002_PERSON_GZ42: [],
            DATA_1002_PERSON_GZA01: [],
        };
        this.calStatus = '';
    };
    /**
     * 现任职务信息
     */
    jobOptions = {};
    /**
     * 低一级职务信息
     */
    beforJobOptions = {};
    /**
     * 测算结果是否全屏
     */
    isFullScreen = false;
    /**
     * 页面加载状态
     */
    isLoading = false;
    /**
     * 是否是新增测算人员
     */
    isNewCreate = false;
    /**
     * 测算身份
     */
    calStatus = '';
    /**
     * 温馨提示内容
     */
    promptMessage = {
        headerTabs: {
            title: '温馨提示',
            message: '请按步骤和提示完善人员信息以便于进行工资测算',
            type: 'string',
        },
        headerBtn: {
            title: '温馨提示',
            afterMessage:
                '1、2006-6-30以后新考录无工作经历人员；2、2006-6-30为试用期人员；可以添加现有人员或新录入信息进行工资测算，录入的人员可以进行存档，存档后可直接进行测算',
            message:
                '适用于: 2006-6-30在册在编的正式职工（包括可以比照在编人员套改的，如军转、企业等）；可以添加现有人员或新录入信息进行工资测算，录入的人员可以进行存档,存档后可直接进行测算。',
            type: 'string',
        },
        firstStep: {
            title: '指标填写说明',
            list: [
                '低一职务没有可以不填写；',
                '学历录入套改时的学历情况；',
                '大专以上未计工龄学习年限将计入套改年限；',
                '1993-2006年除试用期外年度考核不计考核等次或不称职的年限将在套改年限中扣除。',
            ],
            afterList: ['任职录入转正时的任职情况；', '学历录入参工时的学历情况。'],
            type: 'array',
        },
        secondStep: {
            title: '温馨提示',
            list: [
                '此处只用录入2006-6-30后的任职变化情况；',
                '任职信息影响工资测算结果，相同职务/岗位只需录入一条记录。',
            ],
            type: 'array',
        },
        thirdStep: {
            title: '温馨提示',
            message:
                '如不录入测试终止时间，默认测算到当前年份；终止时间必须大于参加工作时间且不能小于小于2006年7月1日；不超过退休时间',
            type: 'string',
        },
        fourthStep: {
            title: '温馨提示',
            message: '标红加粗的工资变迁记录为下次业务预测',
            type: 'string',
        },
    };

    /**
     * 顶部标签栏
     */
    tabs = {
        currentIndex: 0,
        list: ['2006年套改前参公', '2006年套改后参公'],
        SelectedIndexChange: index => {
            if (this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]) {
                this.personDrawer.onTagClose({
                    DATA_3001_PERSON_A01_ID:
                        this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                });
            }
            this.salaryResult.list = [];
            this.wfDate = {};
            this.isNewCreate = false;
            this.isChangeBefor = index === 1 ? false : true;
            this.clearSelectPersonInfo();
            this.personDrawer._init();
            this.jobChangeAfter.selectIndexChange(0);
            if (!this.isChangeBefor) {
                this.jobChanging._unsubscript();
                // 将表单重置为套改后表单
                this.salaryResult.mode = 0;
                const workInfoFormControl = ['GZ0232', 'GZ0206', 'GZ0208'];
                const workTimeFormControl = ['A0134', 'A0134B'];
                this.jobChanging._init(workInfoFormControl, workTimeFormControl);
            } else {
                // 将表单重置为套改前表单
                const workInfoFormControl = ['GZ0232', 'GZ0206', 'GZ0208', 'gapYear', 'yearsLimit'];
                const workTimeFormControl = ['A0134', 'W0405', 'W0152', 'A0134B', 'yearsLimit'];
                this.jobChanging._init(workInfoFormControl, workTimeFormControl);
                this.jobChanging._subscript();
            }
        },
    };

    /**
     * 新增测算人员
     */
    createNewPerson = {
        add: () => {
            if (this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]) {
                this.personDrawer.onTagClose({
                    DATA_3001_PERSON_A01_ID:
                        this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                });
            }
            this.isNewCreate = true;
            this.clearSelectPersonInfo();
            this.jobChanging.identityForm.reset();
            this.jobChanging.lowWorkForm.reset();
            this.jobChanging.workInfoForm.reset();
            this.jobChanging.workTimeForm.reset();
            this.jobOptions = {};
            this.beforJobOptions = {};
            this.salaryResult.list = [];
            this.wfDate = {};
            this.jobChangeAfterTabel.list = this.jobChangeAfterTabel.list.map(item => []);
        },
    };

    /**
     * 选择测算人员
     */
    personDrawer = {
        pageIndex: 1,
        total: 0,
        pageSize: 5,
        visible: false,
        width: 560,
        title: '选择测算人员',
        changeBeforPerson: null,
        changeAfterPerson: null,
        tableData: [],
        selectList: [], // 已确认选中的人员
        currentSelect: [], // 当前暂时选中的人员
        allChecked: false,
        indeterminate: false,
        open: (bool = true) => {
            if (bool && this.personDrawer.tableData.length === 0) {
                // 人员选择列表为空
                this.getPersonTableList();
            } else {
                this.personDrawer._setChecked();
            }
            if (bool) {
                this.personDrawer.visible = true;
            }
        },
        close: () => {
            this.personDrawer.visible = false;
        },
        /**
         * 确认选择
         */
        confirmSelect: () => {
            this.salaryResult.list = [];
            this.wfDate = {};
            this.isNewCreate = false;
            const index = this.isChangeBefor ? 0 : 1;
            if (this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]) {
                // 清除之前缓存的人员信息
                this.personDrawer.onTagClose({
                    DATA_3001_PERSON_A01_ID:
                        this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                });
            }
            // 找到被选中的人员
            this.personDrawer.selectList[index] = this.personDrawer.tableData.find(
                item => item.checked === true
            );
            // 加载选中的人员信息
            let personId = null;
            if (this.personDrawer.selectList[index]) {
                personId = this.personDrawer.selectList[index].DATA_3001_PERSON_A01_ID;
                this._getUserInfoById(personId);
            }
            this.personDrawer.close();
        },
        /**
         * 点击单行选择框
         */
        onItemChecked: () => {
            this.personDrawer._setCurrentSelect();
            this.personDrawer._getAllCheckStatus();
        },
        /**
         * 取消选择
         */
        onTagClose: item => {
            const i = this.isChangeBefor ? 0 : 1;
            const id = item.DATA_3001_PERSON_A01_ID;
            this._delete(id, () => {
                this.personDrawer.selectList[i] = null;
                const index = this.personDrawer.tableData.findIndex(
                    select => select.DATA_3001_PERSON_A01_ID === item.DATA_3001_PERSON_A01_ID
                );
                if (this.personDrawer.tableData[index]) {
                    this.personDrawer.tableData[index].checked = false;
                }
                this.personDrawer.tableData = [...this.personDrawer.tableData];
                this.personDrawer._getAllCheckStatus();
                this.personDrawer._setCurrentSelect();
                this.clearSelectPersonInfo();
            });
        },
        find: {
            selectedValue: null,
            listOfOption: [],
            nzFilterOption: () => true,
            search: value => {
                this.personDrawer.find.listOfOption = this.personDrawer.tableData
                    .filter(item => item.A0101.includes(value))
                    .map(item => {
                        return {
                            text: item.A0101,
                            value: item.DATA_3001_PERSON_A01_ID,
                        };
                    });
            },
            select: value => {
                if (!value) return;
                const index = this.personDrawer.tableData.findIndex(
                    item => item.DATA_3001_PERSON_A01_ID === value
                );
                this.personDrawer.tableData[index].checked = true;
                this.personDrawer.onItemChecked();
            },
        },
        /**
         * 设置选中状态
         */
        _setChecked: () => {
            const i = this.isChangeBefor ? 0 : 1;
            const person = this.personDrawer.selectList[i];
            this.personDrawer.tableData.forEach((item, i) => {
                this.personDrawer.tableData[i].checked = false;
                if (item.DATA_3001_PERSON_A01_ID === person?.DATA_3001_PERSON_A01_ID) {
                    this.personDrawer.tableData[i].checked = true;
                }
            });
            this.personDrawer._setCurrentSelect();
            this.personDrawer.onItemChecked();
        },
        /**
         * 当前选中人员列表
         */
        _setCurrentSelect: () => {
            this.personDrawer.currentSelect = this.personDrawer.tableData.filter(
                item => item.checked
            );
        },
        /**
         * 当前全选状态
         */
        _getAllCheckStatus: () => {
            this.personDrawer.allChecked = this.personDrawer.tableData.every(
                item => item.checked === true
            );
            if (this.personDrawer.allChecked) {
                this.personDrawer.indeterminate = false;
            } else {
                this.personDrawer.indeterminate = this.personDrawer.tableData.some(
                    item => item.checked === true
                );
            }
        },
        /**
         * 重置选择人员弹窗数据
         */
        _init: () => {
            this.personDrawer.tableData = [];
            this.personDrawer.currentSelect = [];
            this.personDrawer.allChecked = false;
            this.personDrawer.indeterminate = false;
            this.personDrawer.find.selectedValue = null;
            this.personDrawer.find.listOfOption = [];
        },
    };

    /**
     * 存档
     */
    savePerson() {
        const workTimeData = this.jobChanging.workTimeForm.getRawValue();
        if (!workTimeData || !workTimeData.A0134) {
            this.message.warning('请选择参加工作时间');
            return;
        }
        if (
            !this.selectPersonInfo ||
            !this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
        ) {
            return;
        }
        const params = {
            jobId: this.wfInfo.jobId,
            jobStepId: this.wfInfo.jobStepId,
            keyIds: [this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]],
        };
        this.service.savePsnData(params).subscribe(val => {});
    }
    /**
     * 查看存档信息
     */
    showSaveData = {
        visible: false,
        title: '查看存档',
        width: 500,
        pageIndex: 1,
        pageSize: 5,
        allChecked: false,
        indeterminate: false,
        select: null, // 已选择人员
        current: null, // 当前选择人员
        saveList: [],
        close: () => {
            this.showSaveData.visible = false;
        },
        open: () => {
            this.showSaveData._loadData(this.wfInfo);
            this.showSaveData.visible = true;
        },
        onItemChecked: (data, event) => {
            if (event) {
                this.showSaveData.current = data;
                this.showSaveData.saveList.forEach(item => {
                    item.checked = false;
                    if (
                        item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                        data[`${this.tableHelper.getTableCode('A01')}_ID`]
                    ) {
                        item.checked = true;
                    }
                });
            } else {
                this.showSaveData.current = null;
            }
            this.showSaveData._initAllCheck();
        },
        delete: data => {
            this.modal.confirm({
                nzTitle: '系统提示?',
                nzContent: '<b style="color: red;">确认删除?</b>',
                nzOkText: '是',
                nzOkType: 'primary',
                nzOkDanger: true,
                nzOnOk: () => {
                    const id = data[`${this.tableHelper.getTableCode('A01')}_ID`];
                    if (!id) {
                        return;
                    }
                    const params = {
                        jobId: this.wfInfo.jobId,
                        jobStepId: this.wfInfo.jobStepId,
                        keyIds: [id],
                    };
                    this.service.delSavePsn(params).subscribe(val => {
                        const index = this.showSaveData.saveList.findIndex(
                            item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === id
                        );
                        this.showSaveData.saveList.splice(index, 1);
                        this.showSaveData.saveList = [...this.showSaveData.saveList];
                    });
                },
                nzCancelText: '否',
            });
        },
        save: () => {
            this.salaryResult.list = [];
            this.showSaveData.select = this.showSaveData.current;
            this._getUserInfoById(
                this.showSaveData.select[`${this.tableHelper.getTableCode('A01')}_ID`],
                true
            );
            this.showSaveData.close();
        },
        /**
         * 初始化选中状态
         */
        _initChecked: () => {
            if (this.showSaveData.select) {
                this.showSaveData.saveList.forEach(item => {
                    item.checked = false;
                    if (
                        item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                        this.showSaveData.select[`${this.tableHelper.getTableCode('A01')}_ID`]
                    ) {
                        item.checked = true;
                    }
                });
            } else {
                this.showSaveData.saveList.forEach(item => {
                    item.checked = false;
                });
            }
        },
        /**
         * 初始化全选状态
         */
        _initAllCheck: () => {
            let type = false;
            type = this.showSaveData.saveList.every(item => item?.checked === true);
            if (type) {
                this.showSaveData.allChecked = true;
                this.showSaveData.indeterminate = false;
                return;
            }
            type = this.showSaveData.saveList.some(item => item?.checked === true);
            if (type) {
                this.showSaveData.allChecked = false;
                this.showSaveData.indeterminate = true;
            } else {
                this.showSaveData.allChecked = false;
                this.showSaveData.indeterminate = false;
            }
        },
        /**
         * 加载存档人员列表
         */
        _loadData: wfInfo => {
            if (!wfInfo?.jobId) {
                return;
            }
            const params = {
                jobId: wfInfo.jobId,
                jobStepId: wfInfo.jobStepId,
            };
            // 获取存档人员id
            this.service.getSavePsnList(params).subscribe(val => {
                if (val && val.length > 0) {
                    this.showSaveData.saveList = [];
                    // 获取存档人员数据
                    this.service.getPsnList(this.service.wfId, params).subscribe(data => {
                        this.wfDate = data;
                        val.forEach(element => {
                            // 获取人员基本信息
                            let person = data[`${this.tableHelper.getTableCode('A01')}`].find(
                                item =>
                                    item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                    element[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            // 获取职务信息并按时间排序
                            const jobInfo = this.wfDate[
                                `${this.tableHelper.getTableCode('GZ02')}`
                            ].filter(
                                item =>
                                    item[`${this.tableHelper.getTableCode('GZ02')}_A01_ID`] ===
                                    element[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            jobInfo.sort((item1, item2) => {
                                return (
                                    new Date(item1.GZ0206).getTime() -
                                    new Date(item2.GZ0206).getTime()
                                );
                            });
                            // 构造表格数据
                            if (jobInfo && jobInfo.length > 0) {
                                this.showSaveData.saveList.push({
                                    ...person,
                                    ...jobInfo[jobInfo.length - 1],
                                    SAVE_TIME: element.SAVE_TIME,
                                });
                            } else {
                                this.showSaveData.saveList.push({
                                    ...person,
                                    SAVE_TIME: element.SAVE_TIME,
                                });
                            }
                        });
                        console.log(this.isChangeBefor);
                        if (this.isChangeBefor) {
                            this.showSaveData.saveList = this.showSaveData.saveList.filter(
                                item => new Date(item.A0134) <= new Date('2006-06-30')
                            );
                        } else {
                            this.showSaveData.saveList = this.showSaveData.saveList.filter(
                                item => new Date(item.A0134) > new Date('2006-06-30')
                            );
                        }
                        this.showSaveData.saveList = [...this.showSaveData.saveList];
                        this.showSaveData._initChecked();
                        this.showSaveData._initAllCheck();
                    });
                }
            });
        },
    };

    /**
     * 工改时信息标签栏
     */
    jobChangingTabs = {
        currentIndex: 0,
        list: ['学历和身份', '任职情况', '参加工作时间'],
    };

    /**
     * 工改时表单信息
     */
    jobChanging = {
        saveLoading: false,
        timeOut: null,
        subscriptWorkInfo: null,
        subscriptLowWorkInfo: null,
        subscriptWorkTime: null,
        /**
         * 身份信息
         */
        identityForm: new FormGroup({
            // 身份
            A0151: new FormControl(null),
            // 学历
            GZ0101: new FormControl(null),
        }),
        /**
         * 职位信息
         */
        workInfoForm: new FormGroup({
            // 任职
            GZ0232: new FormControl(null),
            // 任职时间
            GZ0206: new FormControl(null),
            // 是否领导
            GZ0208: new FormControl(null),
            // 间断
            gapYear: new FormControl(null),
            // 任职年限
            yearsLimit: new FormControl({ value: null, disabled: true }),
        }),
        /**
         * 低一职位信息
         */
        lowWorkForm: new FormGroup({
            // 任职
            GZ0232: new FormControl(null),
            // 任职时间
            GZ0206: new FormControl(null),
            // 是否领导
            GZ0208: new FormControl(null),
            // 间断
            gapYear: new FormControl(null),
            // 套改年限
            yearsLimit: new FormControl({ value: null, disabled: true }),
        }),
        /**
         * 参加工作时间
         */
        workTimeForm: new FormGroup({
            // 参工时间
            A0134: new FormControl(null),
            // 大专以上未计工龄学习年限
            W0405: new FormControl(null),
            // 不称职
            W0152: new FormControl(null),
            // 工龄间断
            A0134B: new FormControl(null),
            // 套改年限
            yearsLimit: new FormControl({ value: null, disabled: true }),
        }),
        /**
         * 计算任职情况套改年限
         * @param i 0时任，1低一级职务
         */
        calJobInfoLimit: i => {
            if (i === 0) {
                // 时任
                const formData = this.jobChanging.workInfoForm.getRawValue();
                const gapYear = !!formData.gapYear ? parseInt(formData.gapYear) : 0;
                if (!formData.GZ0206) return;
                let limitYear = 2006 - new Date(formData.GZ0206).getFullYear() - gapYear + 1;
                if (!isNaN(limitYear)) {
                    this.jobChanging.workInfoForm.patchValue({ yearsLimit: limitYear });
                }
            } else {
                // 低一职务
                const formData = this.jobChanging.lowWorkForm.getRawValue();
                const gapYear = !!formData.gapYear ? parseInt(formData.gapYear) : 0;
                if (!formData.GZ0206) return;
                let limitYear = 2006 - new Date(formData.GZ0206).getFullYear() - gapYear + 1;
                if (!isNaN(limitYear)) {
                    this.jobChanging.lowWorkForm.patchValue({ yearsLimit: limitYear });
                }
            }
        },
        /**
         * 计算工作时间套改年限
         */
        calWorkTimeLimit: () => {
            const formData = this.jobChanging.workTimeForm.getRawValue();
            const A0134B = !!formData.A0134B ? parseInt(formData.A0134B) : 0;
            const W0405 = !!formData.W0405 ? parseInt(formData.W0405) : 0;
            const W0152 = !!formData.W0152 ? parseInt(formData.W0152) : 0;
            if (!formData.A0134) return;
            let limitYear =
                2006 - new Date(formData.A0134).getFullYear() + 1 + W0405 - W0152 - A0134B;
            if (!isNaN(limitYear)) {
                this.jobChanging.workTimeForm.patchValue({ yearsLimit: limitYear });
            }
        },
        /**
         * 保存表单信息
         */
        saveFormData: async () => {
            const idFormData = this.jobChanging.identityForm.getRawValue();
            const jobFormData = this.jobChanging.workInfoForm.getRawValue();
            const lowJobFormData = this.jobChanging.lowWorkForm.getRawValue();
            const workTimeData = this.jobChanging.workTimeForm.getRawValue();
            const A0134B = !!workTimeData.A0134B ? parseInt(workTimeData.A0134B) : 0;
            let paramsList = [];

            if (!workTimeData.A0134) {
                this.message.warning('请选择参加工作时间');
                return;
            }
            // 新增测算人员保存
            let A0134A =
                new Date().getFullYear() -
                new Date(workTimeData.A0134).getFullYear() -
                parseInt(workTimeData.A0134B) +
                1;
            this.jobChanging.saveLoading = true;
            // 未成功响应数据
            if (this.jobChanging.timeOut) clearTimeout(this.jobChanging.timeOut);
            this.jobChanging.timeOut = setTimeout(() => {
                if (this.jobChanging.saveLoading) {
                    this.message.warning('保存失败');
                    this.jobChanging.saveLoading = false;
                }
            }, 5000);
            if (!this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]) {
                let name = Mock.mock('@cname');
                const data = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                    jobDataId: this.wfInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.ADD,
                    tableId: `${this.tableHelper.getTableCode('A01')}`,
                    data: {
                        A0151: idFormData.A0151,
                        A0134: workTimeData.A0134,
                        A0134B,
                        A0134A,
                        A0101: name,
                    },
                };
                const saveInfo = await this._addNewPerson(data);
                this.wfDate['keyId'] = saveInfo.keyId;
                this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`] =
                    saveInfo.keyId;
            } else {
                // 保存基本信息参数
                const A01Params = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                    jobDataId: this.wfInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                    tableId: `${this.tableHelper.getTableCode('A01')}`,
                    data: {
                        A0151: idFormData.A0151,
                        A0134: workTimeData.A0134,
                        A0134B: workTimeData.A0134B,
                        A0134A,
                    },
                };
                paramsList.push(A01Params);
            }

            // 保存低一级职务信息参数
            if (this.isChangeBefor && lowJobFormData.GZ0232) {
                const isLowUpdate =
                    this.selectPersonInfo.jobInfo.length > 1 && this.selectPersonInfo.jobInfo[1];
                const lowGZ02Params = this.jobChanging._getGZ02Params(
                    lowJobFormData,
                    1,
                    isLowUpdate
                );
                paramsList.push(lowGZ02Params);
            }

            // 保存职务信息参数
            if (jobFormData.GZ0232) {
                const isUpdate =
                    this.selectPersonInfo.jobInfo.length > 0 && this.selectPersonInfo.jobInfo[0];
                const GZ02Params = this.jobChanging._getGZ02Params(jobFormData, 0, isUpdate);
                paramsList.push(GZ02Params);
            }

            // 保存任职间断参数
            if (this.isChangeBefor) {
                // 低一级职务间断
                if (parseInt(lowJobFormData.gapYear) > 0) {
                    const GZ14LowParams = this.jobChanging._getGZ14Params(lowJobFormData, 1);
                    paramsList.push(GZ14LowParams);
                }
                // 现任职务间断
                if (parseInt(jobFormData.gapYear) > 0) {
                    const GZ14Params = this.jobChanging._getGZ14Params(jobFormData, 0);
                    paramsList.push(GZ14Params);
                }
            }

            // 保存教育信息
            const GZ01Params = this.jobChanging._getGZ01Params(idFormData);
            paramsList.push(GZ01Params);

            // 保存未记工龄和不称职
            const GZA01Params = this.jobChanging._getGZA01Params(workTimeData);
            paramsList.push(GZA01Params);

            this.service.saveMultipleTableData(paramsList).subscribe(val => {
                this.jobChanging.saveLoading = false;
                if (this.jobChanging.timeOut) clearTimeout(this.jobChanging.timeOut);
                const params = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                };
                this.service.getPsnList(this.service.wfId, params).subscribe(data => {
                    this.wfDate = data;
                    this._getUserInfoById(
                        this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                        true
                    );
                });
            });
        },
        /**
         * 获取任职记录保存参数
         * @param jobFormData 表单数据
         * @param index 0保存时任记录，1保存低一级职务
         * @param type true修改，false新增
         */
        _getGZ02Params: (jobFormData, index, type: boolean) => {
            // 任职字段同步
            const val = jobFormData.GZ0232.substring(0, 2);
            const lastTowCode = jobFormData.GZ0232.substring(jobFormData.GZ0232.length - 2);
            let GZ02Data = {
                GZ0232: jobFormData.GZ0232,
                GZ0206: jobFormData.GZ0206,
                GZ0208: jobFormData.GZ0208,
            };
            switch (val) {
                case '01':
                case '07':
                    GZ02Data['GZ0226'] = '01';
                    GZ02Data['GZ0201'] = lastTowCode;
                    break;
                case '02':
                    GZ02Data['GZ0226'] = '07';
                    GZ02Data['GZ0204'] = jobFormData.GZ0232[jobFormData.GZ0232.length - 1];
                    break;
                case '03':
                    GZ02Data['GZ0226'] = '05';
                    GZ02Data['GZ0202'] = '1' + lastTowCode;
                    break;
                case '04':
                    GZ02Data['GZ0226'] = '06';
                    GZ02Data['GZ0202'] = '2' + lastTowCode;
                    break;
                case '05':
                    GZ02Data['GZ0226'] = '09';
                    GZ02Data['GZ0202'] = '3' + lastTowCode;
                    break;
            }
            const GZ02Params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: type ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                tableId: `${this.tableHelper.getTableCode('GZ02')}`,
                data: GZ02Data,
            };
            if (type) {
                GZ02Params['childId'] =
                    this.selectPersonInfo.jobInfo[index][
                        `${this.tableHelper.getTableCode('GZ02')}_ID`
                    ];
            }
            return GZ02Params;
        },
        /**
         * 获取未记工龄和不称职保存参数
         * @param workTimeData 工作时间表单
         */
        _getGZA01Params: workTimeData => {
            const type = !!this.selectPersonInfo.salaryInfo[0]?.DATA_1002_PERSON_GZA01_ID;
            let data = {};
            if (this.isChangeBefor) {
                data = {
                    W0405: workTimeData.W0405,
                    W0152: workTimeData.W0152,
                };
            } else {
                data = {
                    W0405: '0',
                    W0152: '0',
                };
            }
            const GZA01Params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: type ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                tableId: `${this.tableHelper.getTableCode('GZA01')}`,
                data,
            };
            if (type) {
                GZA01Params['childId'] =
                    this.selectPersonInfo['salaryInfo'][0].DATA_1002_PERSON_GZA01_ID;
            }
            return GZA01Params;
        },
        /**
         * 获取学历信息保存参数
         * @param idFormData
         */
        _getGZ01Params: idFormData => {
            // DATA_1002_PERSON_GZ01_ID;
            let type =
                !!this.selectPersonInfo.eduInfo[`${this.tableHelper.getTableCode('GZ01')}_ID`];
            const data = {
                GZ0101: idFormData.GZ0101,
            };
            if (!type) {
                if (this.isChangeBefor) {
                    data['GZ0102'] = '2006-06-29';
                } else {
                    const worTime = this.jobChanging.workTimeForm.getRawValue();
                    const year = new Date(worTime.A0134).getFullYear() - 1;
                    const month = new Date(worTime.A0134).getMonth() + 1;
                    const day = new Date(worTime.A0134).getDate();
                    data['GZ0102'] = new Date(`${year}-${month}-${day}`);
                }
            }
            const GZ01Params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: type ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                tableId: `${this.tableHelper.getTableCode('GZ01')}`,
                data,
            };
            // DATA_1002_PERSON_GZ01_ID;
            if (type) {
                GZ01Params['childId'] =
                    this.selectPersonInfo.eduInfo[`${this.tableHelper.getTableCode('GZ01')}_ID`];
            }
            return GZ01Params;
        },
        /**
         * 获取任职间断保存参数
         * @param jobFormData 职务信息表单
         * @param index 0现任职务，1低一级职务
         */
        _getGZ14Params: (jobFormData, index: number) => {
            const newCreate =
                this.selectPersonInfo['gapInfo']?.length > 0 &&
                this.selectPersonInfo['gapInfo'][index];
            const gz14Data = {
                GZ1401: jobFormData.GZ0206,
                GZ1402: parseInt(jobFormData.gapYear) * 12,
                GZ1403: 2,
            };
            let gz14Params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: newCreate ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                tableId: `${this.tableHelper.getTableCode('GZ14')}`,
                data: gz14Data,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
            };
            if (newCreate) {
                gz14Params['childId'] =
                    this.selectPersonInfo['gapInfo'][index].DATA_1002_PERSON_GZ14_ID;
            }
            return gz14Params;
        },
        /**
         * 订阅观察对象
         */
        _subscript: () => {
            // 计算时任任职年限
            this.jobChanging.subscriptWorkInfo = this.jobChanging.workInfoForm
                .get('GZ0206')
                .valueChanges.subscribe(data => {
                    this.jobChanging.calJobInfoLimit(0);
                });
            // 计算低一级职务任职年限
            this.jobChanging.subscriptLowWorkInfo = this.jobChanging.lowWorkForm
                .get('GZ0206')
                .valueChanges.subscribe(data => {
                    this.jobChanging.calJobInfoLimit(1);
                });
            // 计算套改年限
            this.jobChanging.subscriptWorkTime = this.jobChanging.workTimeForm
                .get('A0134')
                .valueChanges.subscribe(data => {
                    this.jobChanging.calWorkTimeLimit();
                });
        },
        /**
         * 取消订阅
         */
        _unsubscript: () => {
            this.jobChanging.subscriptWorkInfo.unsubscribe();
            this.jobChanging.subscriptLowWorkInfo.unsubscribe();
            this.jobChanging.subscriptWorkTime.unsubscribe();
        },
        /**
         * 重新初始化职位信息和参加工作时间表单
         * @param workInfoFormControl 职位信息表单控制项列表
         * @param workTimeFormControl 参加工作时间表单控制项列表
         */
        _init: (workInfoFormControl, workTimeFormControl) => {
            this.jobChanging.workInfoForm = new FormGroup({});
            this.jobChanging.workTimeForm = new FormGroup({});
            workInfoFormControl.forEach(item => {
                if (item === 'yearsLimit') {
                    this.jobChanging.workInfoForm.addControl(
                        item,
                        new FormControl({ value: null, disabled: true })
                    );
                } else {
                    this.jobChanging.workInfoForm.addControl(item, new FormControl(null));
                }
            });
            workTimeFormControl.forEach(item => {
                if (item === 'yearsLimit') {
                    this.jobChanging.workTimeForm.addControl(
                        item,
                        new FormControl({ value: null, disabled: true })
                    );
                } else {
                    this.jobChanging.workTimeForm.addControl(item, new FormControl(null));
                }
            });
        },
    };

    /**
     * 工改后信息变动情况标签栏
     */
    jobChangeAfter = {
        currentIndex: 0,
        list: [
            {
                text: '任职情况',
                code: 'GZ02',
                date: 'GZ0206',
                msgList: [
                    '此处只用录入2006-6-30后的任职变化情况；',
                    '任职信息影响工资测算结果，相同职务/岗位只需录入一条记录。',
                ],
                afterMsgList: [
                    '此处只用录入转正后的任职变化情况；',
                    '任职信息影响工资测算结果，相同职务/岗位只需录入一条记录。',
                ],
            },
            {
                text: '学历变化',
                code: 'GZ01',
                date: 'GZ0102',
                msgList: ['此处只用录入2006-6-30后取得的学历。'],
                afterMsgList: ['此处只用录入参工后取得的学历。'],
            },
            {
                text: '考核变化',
                code: 'GZ06',
                date: 'GZ0601',
                msgList: [
                    '考核情况在不填写的情况下，默认按称职/合格，进行测算；',
                    '只需录入06年之后考核结果不是称职/合格的考核记录',
                ],
            },
            {
                text: '高低定',
                code: 'GZ09',
                date: 'GZ0901',
                msgList: [],
            },
            {
                text: '处分变动',
                code: 'GZ42',
                date: 'GZ4201',
                msgList: ['处分类型为撤职，需录入撤职的级数'],
            },
        ],
        selectIndexChange: index => {
            this.jobChangeAfterTabel.addData = {};
            if (!this.jobChangeAfterTabel.list[index]) this.jobChangeAfterTabel.list[index] = [];
            if (this.jobChangeAfterTabel.list[index].length > 0) {
                return;
            } else {
                this.jobChangeAfterTabel.list[index] = [];
                const data = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                };
                this.jobChangeAfterTabel.tabLoading = true;
                this.service.getPsnList(this.service.wfId, data).subscribe(val => {
                    this.jobChangeAfterTabel.tabLoading = false;
                    this.wfDate = val;
                    const id = this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`];
                    this.getPersonData(id);
                    let i = this.jobChangeAfter.currentIndex;
                    this._getTableList(
                        i,
                        this.jobChangeAfter.list[i].code,
                        this.jobChangeAfter.list[i].date,
                        true,
                        this.personWfData
                    );
                });
            }
        },
    };

    /**
     * 工改后信息变动情况表格
     */
    jobChangeAfterTabel = {
        tabLoading: false,
        saveLoading: false,
        delLoading: false,
        addData: {},
        list: [[]],
        tableHeader: [],
        // 保存
        save: () => {
            if (
                !this.jobChangeAfterTabel.addData ||
                Object.keys(this.jobChangeAfterTabel.addData).length <= 0
            ) {
                this.message.warning('请正确填入添加信息');
                return;
            }
            const index = this.jobChangeAfter.currentIndex;
            const code = this.jobChangeAfter.list[index].code;
            const date = this.jobChangeAfter.list[index].date;
            let params = {};
            if (code === 'GZ02') {
                if (
                    new Date(this.jobChangeAfterTabel.addData['GZ0206']) <
                    new Date(this.selectPersonInfo.jobInfo[0].GZ0206)
                ) {
                    this.message.warning('新增职务任职时间不能在参加工作（转正定级）时任时间之前');
                    return;
                }
                params = this.jobChanging._getGZ02Params(
                    this.jobChangeAfterTabel.addData,
                    0,
                    false
                );
            } else {
                params = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                    jobDataId: this.wfInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.ADD,
                    keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                    tableId: `${this.tableHelper.getTableCode(code)}`,
                    data: this.jobChangeAfterTabel.addData,
                };
            }
            this.jobChangeAfterTabel.saveLoading = true;
            this.service.saveMultipleTableData([params]).subscribe(val => {
                this.jobChangeAfterTabel.addData = {};
                // 更新业务数据
                const data = {
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                };
                this.jobChangeAfterTabel.tabLoading = true;
                this.service.getPsnList(this.service.wfId, data).subscribe(val => {
                    this.jobChangeAfterTabel.tabLoading = false;
                    this.jobChangeAfterTabel.saveLoading = false;
                    this.wfDate = val;
                    const id = this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`];
                    this._getUserInfoById(id, true);
                });
            });
        },
        // 取消
        cancel: () => {
            this.jobChangeAfterTabel.addData = {};
        },
        // 删除
        delete: index => {
            const tabIndex = this.jobChangeAfter.currentIndex;
            const code = this.jobChangeAfter.list[tabIndex].code;
            const deleteItem = this.jobChangeAfterTabel.list[tabIndex][index];
            this.jobChangeAfterTabel.delLoading = true;
            this._deleteData(
                this.tableHelper.getTableCode(code),
                deleteItem[`${this.tableHelper.getTableCode(code)}_ID`],
                () => {
                    this.jobChangeAfterTabel.delLoading = false;
                    this.jobChangeAfterTabel.list[tabIndex].splice(index, 1);
                    this.jobChangeAfterTabel.list[tabIndex] = [
                        ...this.jobChangeAfterTabel.list[tabIndex],
                    ];
                }
            );
        },
        /**
         * 设置年份选择范围
         */
        disabledDate: (current: Date): boolean => {
            if (this.isChangeBefor) {
                // 2006.06.30之后的时间
                return differenceInCalendarDays(current, new Date('2006-07-01')) < 0;
            } else {
                // 参加工作之后的时间
                return (
                    differenceInCalendarDays(current, new Date(this.selectPersonInfo['A0134'])) < 0
                );
            }
        },
    };

    /**
     * 测算终止时间
     */
    finishTime = {
        date: null,
        calcLoading: false,
        clearLoading: false,
        timeOut: null,
        dateChange: event => {},
        /**
         * 开始测算
         */
        startCalculate: () => {
            if (
                !this.selectPersonInfo ||
                !this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
            ) {
                this.message.warning('基本信息未保存');
                return;
            }
            // 如果之前表头未请求成功
            this.salaryResult.tableHeader = [...this.salaryResult.tableHeader];
            if (!this.salaryResult.tableHeader || this.salaryResult.tableHeader.length <= 0) {
                this._getFinishTableHeader(this.personWfData.DATA_1002_PERSON_GZ02);
            }
            // 开始测算
            const par = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                isAllData: true,
                handlerIds: ['B01'],
                keyIds: [this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]],
            };
            if (this.finishTime.date) {
                // 测算截止时间
                const year = new Date(this.finishTime.date).getFullYear();
                let month = `${new Date(this.finishTime.date).getMonth() + 1}`;
                let day = `${new Date(this.finishTime.date).getDate()}`;
                if (month.length === 1) month = `0${month}`;
                if (day.length === 1) day = `0${day}`;
                par['endTime'] = `${year}-${month}-${day}`;
            }
            this.finishTime.calcLoading = true;
            // 未成功响应数据
            if (this.finishTime.timeOut) clearTimeout(this.finishTime.timeOut);
            this.finishTime.timeOut = setTimeout(() => {
                if (this.finishTime.calcLoading) {
                    this.message.warning('测算失败');
                    this.finishTime.calcLoading = false;
                }
            }, 5000);
            this.service.salaryExecute(par).subscribe(val => {
                this.finishTime.calcLoading = false;
                if (this.finishTime.timeOut) clearTimeout(this.finishTime.timeOut);
                if (val) {
                    const data = {
                        jobId: this.wfInfo.jobId,
                        jobStepId: this.wfInfo.jobStepId,
                    };
                    this.service.getPsnList(this.service.wfId, data).subscribe(val => {
                        // 工资变迁
                        this.personWfData['DATA_1002_PERSON_GZ07'] =
                            val.DATA_1002_PERSON_GZ07.filter(
                                item =>
                                    item[`${this.tableHelper.getTableCode('GZ07')}_A01_ID`] ===
                                    this.selectPersonInfo[
                                        `${this.tableHelper.getTableCode('A01')}_ID`
                                    ]
                            );
                        this.salaryResult.list = this.personWfData['DATA_1002_PERSON_GZ07'];
                        this.salaryResult.total = this.salaryResult.list.length;
                        // 套改情况
                        this.personWfData['DATA_1002_PERSON_GZ10'] =
                            val.DATA_1002_PERSON_GZ10.filter(
                                item =>
                                    item[`${this.tableHelper.getTableCode('GZ10')}_A01_ID`] ===
                                    this.selectPersonInfo[
                                        `${this.tableHelper.getTableCode('A01')}_ID`
                                    ]
                            );
                    });
                }
            });
        },
        /**
         * 清空所有信息
         */
        clear: () => {
            this.modal.confirm({
                nzTitle: '系统提示?',
                nzContent: '<b style="color: red;">清空所有信息?</b>',
                nzOkText: '是',
                nzOkType: 'primary',
                nzOkDanger: true,
                nzOnOk: () => {
                    if (
                        !this.selectPersonInfo ||
                        !this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                    ) {
                        return;
                    }
                    let dataArray = [];
                    // 清除表册数据
                    for (let table in this.wfDate) {
                        if (this.wfDate[table]?.length > 0 && table !== 'DATA_3001_PERSON_A01') {
                            this.wfDate[table].forEach(element => {
                                dataArray.push({
                                    childId: element[`${table}_ID`],
                                    keyId: this.selectPersonInfo[
                                        `${this.tableHelper.getTableCode('A01')}_ID`
                                    ],
                                    jobId: this.wfInfo.jobId,
                                    jobStepId: this.wfInfo.jobStepId,
                                    jobDataId: this.wfInfo.jobDataId,
                                    changeType: WfDataChangeTypeEnum.DELETE,
                                    tableId: table,
                                });
                            });
                        }
                    }
                    // 清除A01数据
                    const A01Data = {
                        jobId: this.wfInfo.jobId,
                        jobStepId: this.wfInfo.jobStepId,
                        jobDataId: this.wfInfo.jobDataId,
                        changeType: WfDataChangeTypeEnum.MODIFY,
                        keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                        tableId: `${this.tableHelper.getTableCode('A01')}`,
                        data: {
                            A0134: '',
                            A0134A: '',
                            A0134B: '',
                            A0151: '',
                            A0151_CN: '',
                        },
                    };
                    this.finishTime.clearLoading = true;
                    this.service.deleteTableData(dataArray).subscribe(() => {
                        this.service.saveChangeData(A01Data).subscribe(val => {
                            this.finishTime.clearLoading = false;
                            this.finishTime._clearPageData();
                        });
                    });
                },
                nzCancelText: '否',
            });
        },
        /**
         * 清除页面数据
         */
        _clearPageData: () => {
            this.jobChanging.identityForm.reset();
            this.jobChanging.lowWorkForm.reset();
            this.jobChanging.workInfoForm.reset();
            this.jobChanging.workTimeForm.reset();
            this.jobChangeAfterTabel.list = this.jobChangeAfterTabel.list.map(item => []);
            this.jobOptions = {};
            this.beforJobOptions = {};
            this.salaryResult.list = [];
            this.salaryResult.mode = 0;
            this.wfDate = {};
            let id = this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`];
            this.clearSelectPersonInfo();
            this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`] = id;
        },
    };

    /**
     * 测算结果表格
     */
    salaryResult = {
        pageIndex: 1,
        total: 0,
        pageSize: 10,
        mode: 0,
        pageSizeOptions: [5, 10, 20, 50],
        list: [],
        loading: false,
        tableHeader: [],
        permissions: ['GWYSalaryChange', 'officeSalaryChange', 'causeSalaryChange'],
        tabsChange: type => {
            this.salaryResult.list = [];
            if (type === 0) {
                this.salaryResult.mode = 0;
                if (this.personWfData['DATA_1002_PERSON_GZ07']?.length > 0) {
                    this.salaryResult.total = this.personWfData['DATA_1002_PERSON_GZ07'].length;
                    this.salaryResult.list = this.personWfData['DATA_1002_PERSON_GZ07'];
                }
            } else {
                this.salaryResult.mode = 1;
                if (this.personWfData['DATA_1002_PERSON_GZ10']?.length > 0) {
                    this.salaryResult.total = this.personWfData['DATA_1002_PERSON_GZ10'].length;
                    this.salaryResult.list = this.personWfData['DATA_1002_PERSON_GZ10'];
                }
            }
        },
    };

    /**
     * 按时间获取人员列表
     * @param DATE 时间
     * @param OPERATOR 0大于，1小于
     */
    getPersonTableList() {
        let type = 1;
        if (!this.isChangeBefor) {
            type = 0;
        }
        const data = {
            $PAGE_INDEX$: this.personDrawer.pageIndex,
            $PAGE_SIZE$: this.personDrawer.pageSize,
            $QUERY_FIELDS$: 'A0101,A0184,A0107,A0104,A0134',
            A0103: '01',
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
            UNIT_TYPE: '03',
            DATA_UNIT_ORG_ID: this.userInfo.unitId,
            ORG_B01_ID: this.userInfo.unitId,
            ORG_TYPE: OrgTypeEnum.UNIT,
            A0134S: {
                DATE: '2006-06-30',
                OPERATOR: type,
            },
        };
        this.service.selectPsnTblData(data).subscribe(val => {
            if (this.personDrawer.pageIndex === 1) {
                this.personDrawer.total = val.totalCount;
            }
            let list = [];
            if (this.isChangeBefor) {
                // 参加工作时间为06年之前的人员
                list = val.result.filter(item => new Date('2006-06-30') > new Date(item.A0134));
            } else {
                // 参加工作时间为06年之后的人员
                list = val.result.filter(item => new Date('2006-06-30') < new Date(item.A0134));
            }
            this.personDrawer.tableData = list.map(item => {
                return {
                    ...item,
                    checked: false,
                };
            });
            this.personDrawer.open(false);
        });
    }

    /**
     * 获取人员基本信息
     * @param id 人员ID
     * @param isSave 是否保存到WfData
     */
    private _getUserInfoById(id, isSave = false) {
        this.salaryResult.total = 0;
        if (!isSave) {
            // 未保存到业务数据
            this.isLoading = true;
            this.service.getPersonDataByID({ DATA_3001_PERSON_A01_ID: id }).subscribe(async val => {
                const GZ01Data = await this._getSetChildData('GZ01', id);
                const GZ02Data = await this._getSetChildData('GZ02', id);
                const GZA01Data = await this._getSetChildData('GZA01', id);
                const GZ06Data = await this._getSetChildData('GZ06', id);
                const GZ09Data = await this._getSetChildData('GZ09', id);
                const GZ42Data = await this._getSetChildData('GZ42', id);
                const obj = {
                    DATA_3001_PERSON_A01: [val],
                    DATA_1002_PERSON_GZ01: GZ01Data,
                    DATA_1002_PERSON_GZ02: GZ02Data,
                    DATA_1002_PERSON_GZ06: GZ06Data,
                    DATA_1002_PERSON_GZ09: GZ09Data,
                    DATA_1002_PERSON_GZ42: GZ42Data,
                    DATA_1002_PERSON_GZA01: GZA01Data,
                };
                this.wfDate = obj;
                this.selectPersonInfo = {
                    ...obj.DATA_3001_PERSON_A01[0],
                    jobInfo: [],
                    salaryInfo: obj.DATA_1002_PERSON_GZA01,
                    eduInfo: [],
                    gapInfo: [],
                };
                this.isLoading = false;
                this._setFormData(obj);
                this._saveDataToWfData();
                this._getTableList(
                    0,
                    this.jobChangeAfter.list[0].code,
                    this.jobChangeAfter.list[0].date
                );
            });
        } else {
            // 已保存到业务数据
            if (!id) {
                return;
            }
            this.getPersonData(id);
            const obj = this.personWfData;
            this.selectPersonInfo = {
                ...obj.DATA_3001_PERSON_A01[0],
                jobInfo: [],
                salaryInfo: obj.DATA_1002_PERSON_GZA01,
                eduInfo: [],
                gapInfo: [],
            };
            this.isLoading = false;
            this._setFormData(obj);
            let i = this.jobChangeAfter.currentIndex;
            this._getTableList(
                i,
                this.jobChangeAfter.list[i].code,
                this.jobChangeAfter.list[i].date,
                true,
                obj
            );
        }
    }

    /**
     * 根据WfData和ID获取人员数据
     */
    private getPersonData(id) {
        const A01 = this.wfDate[`${this.tableHelper.getTableCode('A01')}`].find(
            item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === id
        );
        let GZ01Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZ01')}`]) {
            GZ01Data = this.wfDate[`${this.tableHelper.getTableCode('GZ01')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZ01')}_A01_ID`] === id
            );
        }
        let GZ02Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZ02')}`]) {
            GZ02Data = this.wfDate[`${this.tableHelper.getTableCode('GZ02')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZ02')}_A01_ID`] === id
            );
        }
        let GZ06Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZ06')}`]) {
            GZ06Data = this.wfDate[`${this.tableHelper.getTableCode('GZ06')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZ06')}_A01_ID`] === id
            );
        }
        let GZ09Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZ09')}`]) {
            GZ09Data = this.wfDate[`${this.tableHelper.getTableCode('GZ09')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZ09')}_A01_ID`] === id
            );
        }
        let GZ42Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZ42')}`]) {
            GZ42Data = this.wfDate[`${this.tableHelper.getTableCode('GZ42')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZ42')}_A01_ID`] === id
            );
        }
        let GZA01Data = [];
        if (this.wfDate[`${this.tableHelper.getTableCode('GZA01')}`]) {
            GZA01Data = this.wfDate[`${this.tableHelper.getTableCode('GZA01')}`].filter(
                item => item[`${this.tableHelper.getTableCode('GZA01')}_A01_ID`] === id
            );
        }
        const obj = {
            DATA_3001_PERSON_A01: [A01],
            DATA_1002_PERSON_GZ01: GZ01Data,
            DATA_1002_PERSON_GZ02: GZ02Data,
            DATA_1002_PERSON_GZ06: GZ06Data,
            DATA_1002_PERSON_GZ09: GZ09Data,
            DATA_1002_PERSON_GZ42: GZ42Data,
            DATA_1002_PERSON_GZA01: GZA01Data,
        };
        this.personWfData = obj;
    }

    /**
     * 将选择的人员信息保存到业务数据
     */
    private async _saveDataToWfData() {
        this.isLoading = true;
        // 保存A01数据
        const info = await this._addNewPerson({
            jobId: this.wfInfo.jobId,
            jobStepId: this.wfInfo.jobStepId,
            jobDataId: this.wfInfo.jobDataId,
            changeType: WfDataChangeTypeEnum.ADD,
            keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
            tableId: `${this.tableHelper.getTableCode('A01')}`,
            data: this.wfDate[`${this.tableHelper.getTableCode('A01')}`][0],
        });
        this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`] = info.keyId;
        // 保存子表数据
        const paramsList = [];
        const tableData = ['GZ01', 'GZ02', 'GZ06', 'GZ09', 'GZ42'];
        tableData.forEach(tableCode => {
            for (let item of this.wfDate[`${this.tableHelper.getTableCode(tableCode)}`]) {
                if (tableCode === 'GZ02' && !item.GZ0206) {
                    continue;
                }
                let data = {};
                for (let key in item) {
                    if (key.includes('GZ') && !key.includes('ID')) {
                        data[key] = item[key];
                    }
                }
                paramsList.push({
                    jobId: this.wfInfo.jobId,
                    jobStepId: this.wfInfo.jobStepId,
                    jobDataId: this.wfInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.ADD,
                    keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                    tableId: `${this.tableHelper.getTableCode(tableCode)}`,
                    data: data,
                });
            }
        });
        this.wfDate[`${this.tableHelper.getTableCode('GZA01')}`].forEach(item => {
            paramsList.push({
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: WfDataChangeTypeEnum.ADD,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                tableId: `${this.tableHelper.getTableCode('GZA01')}`,
                data: {
                    W0405: item.W0405,
                    W0152: item.W0152,
                },
            });
        });
        this.service.saveMultipleTableData(paramsList).subscribe(val => {
            this.isLoading = false;
            const params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
            };
            this.service.getPsnList(this.service.wfId, params).subscribe(data => {
                this.isLoading = false;
                this.wfDate = data;
                this._getUserInfoById(
                    this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                    true
                );
            });
        });
    }

    /**
     * 表单赋值
     */
    private _setFormData(val) {
        // 人员身份和学历信息表单赋值
        this.jobChanging.identityForm.patchValue(val.DATA_3001_PERSON_A01[0]);
        if (val.DATA_1002_PERSON_GZ01?.length > 0) {
            this.selectPersonInfo['eduInfo'] = this._getEduInfo(val.DATA_1002_PERSON_GZ01);
            if (this.selectPersonInfo['eduInfo']) {
                this.jobChanging.identityForm.patchValue(this.selectPersonInfo['eduInfo']);
            }
        }
        // 任职信息表单赋值
        if (val.DATA_1002_PERSON_GZ02?.length > 0) {
            this._getFinishTableHeader(val.DATA_1002_PERSON_GZ02);
            this._JobFormPatchValue(val);
        }
        // 参加工作时间表单赋值
        this.jobChanging.workTimeForm.patchValue(val.DATA_3001_PERSON_A01[0]);
        const salaryInfo = val.DATA_1002_PERSON_GZA01;
        let W0152 = null;
        let W0405 = null;
        if (salaryInfo) {
            W0152 = salaryInfo[0] && salaryInfo[0].W0152 ? salaryInfo[0].W0152 : 0;
            W0405 = salaryInfo[0] && salaryInfo[0].W0405 ? salaryInfo[0].W0405 : 0;
            this.jobChanging.workTimeForm.patchValue({ W0152, W0405 });
        }
        this.jobChanging.calWorkTimeLimit();
    }

    /**
     * 获取子表信息
     */
    private _getSetChildData(tableCode, id) {
        return this.service.getSetChildData(tableCode, id).toPromise();
    }

    /**
     * 获取排序后2006.6.30之前取得的学历中序号最大那一条
     */
    private _getEduInfo(eduInfo) {
        let len = eduInfo.length - 1;
        if (eduInfo.length > 1) {
            eduInfo.sort((item1, item2) => {
                return new Date(item1.GZ0102).getTime() - new Date(item2.GZ0102).getTime();
            });
        }
        if (this.isChangeBefor) {
            for (let i = len; i >= 0; i--) {
                if (new Date(eduInfo[i].GZ0102) < new Date('2006.6.30')) {
                    return {
                        ...eduInfo[i],
                        index: i,
                    };
                }
            }
        } else {
            // 查找参加工作时间之前最近的学历记录
            const list = eduInfo.filter(
                item => new Date(item.GZ0102) < new Date(this.selectPersonInfo['A0134'])
            );
            if (list?.length > 0) {
                return {
                    ...list[list.length - 1],
                };
            }
        }
        return {};
    }

    /**
     * 任职情况表单赋值，保存职务间断信息
     */
    private _JobFormPatchValue(val) {
        let jobInfo = val.DATA_1002_PERSON_GZ02;
        if (this.isChangeBefor) {
            //套改前职务列表
            jobInfo = val.DATA_1002_PERSON_GZ02.filter(
                item => new Date(item.GZ0206) < new Date('2006-06-30')
            );
        } else {
            // 套改后职务列表
            jobInfo = val.DATA_1002_PERSON_GZ02.filter(
                item => new Date(item.GZ0206) > new Date('2006-06-30')
            );
        }
        // 职务列表排序
        if (jobInfo.length > 1) {
            jobInfo.sort((item1, item2) => {
                return new Date(item1.GZ0206).getTime() - new Date(item2.GZ0206).getTime();
            });
        }
        /**
         * 套改后
         */
        if (!this.isChangeBefor) {
            if (jobInfo.length > 0) {
                this.jobChanging.workInfoForm.patchValue(jobInfo[0]);
                this.jobOptions = jobInfo[0];
                this.selectPersonInfo.jobInfo[0] = jobInfo[0];
            }
            return;
        }
        /**
         * 套改前
         */
        const workContinuous = val.DATA_1002_PERSON_GZ14;
        for (let i = jobInfo.length - 1; i >= 0; i--) {
            if (jobInfo[i].GZ0206) {
                /**
                 * 获取任职最后一条有效记录作为时任记录
                 */
                this.jobChanging.workInfoForm.patchValue(jobInfo[i]);
                this.jobOptions = jobInfo[i];
                this.selectPersonInfo.jobInfo[0] = jobInfo[i];
                // 获取任职间断记录最后一条，判断是否是时任职务间断
                this.jobChanging.workInfoForm.patchValue({
                    gapYear: 0,
                });
                if (workContinuous?.length > 0) {
                    let len = workContinuous.length - 1;
                    const gapInfo = new Date(workContinuous[len].GZ1401);
                    const jobTime = new Date(jobInfo[i].GZ0206);
                    if (gapInfo >= jobTime) {
                        this.jobChanging.workInfoForm.patchValue({
                            gapYear: workContinuous[len].GZ1402 / 12,
                        });
                        this.selectPersonInfo.jobInfo[0] = jobInfo[i];
                        this.selectPersonInfo['gapInfo'][0] = workContinuous[len];
                    }
                }
                this.jobChanging.calJobInfoLimit(0);
                if (!this.isChangeBefor) {
                    return;
                }
                /**
                 * 将时任职务索引前一条作为低一级职务
                 */
                if (i > 0) {
                    // 获取时任记录上一条记录作为低一级职务
                    this.jobChanging.lowWorkForm.patchValue(jobInfo[i - 1]);
                    this.beforJobOptions = jobInfo[i - 1];
                    this.selectPersonInfo.jobInfo[1] = jobInfo[i - 1];
                    this.jobChanging.lowWorkForm.patchValue({
                        gapYear: 0,
                    });
                    // 获取低一级职务间断时间
                    if (workContinuous?.length > 0) {
                        const firstJobTime = new Date(jobInfo[i].GZ0206);
                        const secJobTime = new Date(jobInfo[i - 1].GZ0206);
                        workContinuous.forEach(item => {
                            if (item.GZ1401) {
                                let gapInfo = new Date(item.GZ1401);
                                if (gapInfo >= secJobTime && gapInfo < firstJobTime) {
                                    this.jobChanging.lowWorkForm.patchValue({
                                        gapYear: item.GZ1402 / 12,
                                    });
                                    this.selectPersonInfo['gapInfo'][1] = item;
                                }
                            }
                        });
                    }
                    this.jobChanging.calJobInfoLimit(1);
                }
                return;
            }
        }
    }

    /**
     * 获取工改时或参工后表格数据
     * @param index 工改时标签栏索引
     * @param table_code 表名
     * @param time_code 时间字段
     */
    private _getTableList(index, table_code, time_code, isNew = false, data = null) {
        if (!this.wfDate || !this.wfDate[`DATA_1002_PERSON_${table_code}`]) {
            return;
        }
        let listData = [];
        let GZ02list = isNew
            ? data[`DATA_1002_PERSON_${table_code}`]
            : this.wfDate[`DATA_1002_PERSON_${table_code}`];
        if (this.isChangeBefor) {
            // 套改前
            listData = GZ02list.filter(item => new Date(item[time_code]) >= new Date('2006-06-30'));
        } else {
            // 套改后
            if (table_code === 'GZ02') {
                if (this.selectPersonInfo.jobInfo[0]) {
                    // 显示参加工作时间之后且时任职务之后的职务记录
                    const workJoinTime = new Date(this.selectPersonInfo['A0134']);
                    const jobTime = new Date(this.selectPersonInfo.jobInfo[0].GZ0206);
                    const jobDate = workJoinTime > jobTime ? workJoinTime : jobTime;
                    listData = GZ02list.filter(item => new Date(item[time_code]) > jobDate);
                }
            } else {
                listData = GZ02list.filter(
                    item => new Date(item[time_code]) > new Date(this.selectPersonInfo['A0134'])
                );
            }
        }
        if (listData.length > 1) {
            listData.sort((item1, item2) => {
                return new Date(item1[time_code]).getTime() - new Date(item2[time_code]).getTime();
            });
        }
        this.jobChangeAfterTabel.list = [];
        this.jobChangeAfterTabel.list[index] = [...listData];
    }

    /**
     * 获取业务数据
     */
    private _selectStepInfo(data) {
        this.service.selectStepInfo(data).subscribe(val => {
            this.wfInfo = val;
            const params = {
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
            };
            this.service.refreshData(params).subscribe(val => {
                this.isLoading = false;
            });
        });
    }

    /**
     * 新增保存人员
     */
    private _addNewPerson(data) {
        return this.service.saveChangeData(data).toPromise();
    }

    /**
     * 获取测算结果表头
     */
    private _getFinishTableHeader(jobInfo) {
        let idStatus = 0;
        switch (jobInfo[jobInfo.length - 1].GZ0226) {
            case '01':
                this.calStatus = '公务员';
                break;
            case '05':
                this.calStatus = '管理人员';
                break;
            case '06':
                this.calStatus = '专业技术人员';
                break;
            case '07':
                this.calStatus = '机关工勤';
                break;
            case '09':
                this.calStatus = '事业工勤';
                break;
        }

        switch (jobInfo[jobInfo.length - 1].GZ0226) {
            case '01': // 公务员
                idStatus = 0;
                break;
            case '07': // 机关
                idStatus = 1;
                break;
            default:
                // 事业
                idStatus = 2;
        }

        this.salaryResult.loading = true;
        this.service
            .getSchemeByPermission(this.salaryResult.permissions[idStatus])
            .subscribe(val => {
                this.salaryResult.loading = false;
                this.salaryResult.tableHeader = val.systemSchemeList.map(
                    item => item.systemSchemeHeader
                );
                this.salaryResult.tableHeader = [...this.salaryResult.tableHeader];
            });
    }

    /**
     * 移除人员
     */
    private _delete(id, callback = () => {}) {
        const data = {
            jobId: this.wfInfo.jobId,
            jobStepId: this.wfInfo.jobStepId,
        };
        this.service.refreshData(data).subscribe(val => {
            callback();
        });
    }

    /**
     * 删除数据
     */
    private _deleteData(TABLE_CODE, childId, callback = () => {}) {
        const dataArray = [
            {
                childId: childId,
                keyId: this.selectPersonInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                jobId: this.wfInfo.jobId,
                jobStepId: this.wfInfo.jobStepId,
                jobDataId: this.wfInfo.jobDataId,
                changeType: WfDataChangeTypeEnum.DELETE,
                tableId: TABLE_CODE,
            },
        ];
        this.service.deleteTableData(dataArray).subscribe(() => {
            callback();
        });
    }
}
