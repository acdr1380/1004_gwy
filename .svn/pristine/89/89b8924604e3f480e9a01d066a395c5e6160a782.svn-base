import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    ViewChild,
    ChangeDetectorRef,
} from '@angular/core';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import * as moment from 'moment';
import { SalaryCivliInnerTransferService } from '../salary-civli-inner-transfer.service';
import { CommonService } from 'app/util/common.service';
import { CivilInnerTransferFields } from '../Interface_scheme/fields';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { LoadingService } from 'app/components/loading/loading.service';
import { CivilStandingChangeComponent } from '../civil-standing-change/civil-standing-change.component';
import { CivilInnerTransferDrawerComponent } from '../civil-inner-transfer-drawer/civil-inner-transfer-drawer.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gz-inner-transfer-person-table',
    templateUrl: './inner-transfer-person-table.component.html',
    styleUrls: ['./inner-transfer-person-table.component.scss'],
})
export class InnerTransferPersonTableComponent implements OnInit, AfterViewInit {
    constructor(
        private service: SalaryCivliInnerTransferService,
        private workService: WorkflowService,
        private message: NzMessageService,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private loading: LoadingService,
        private wfTableCode: WfTableHelper,
        private modalService: NzModalService
    ) {}

    isUpFullScreen = false;
    isDownFullScreen = false;

    /**
     * 是否全屏
     */
    isFullScreen = false;

    /**
     * 用户参数
     */
    userInfo: any;

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
            this.personListIfy._loadPersonList();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /**
     * 是否新加入人员
     */
    @Input() isExistNewPerson = null;

    allChildsDatas = null;
    childIds = ['A01', 'GZ01', 'GZ02', 'GZ06', 'GZ07', 'GZ09', 'GZ10', 'GZ42', 'GZDA07'];

    /**
     * 系统外添加人员标识
     */
    sysOuterStatus = false;

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;
    /**
     * 第二步 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
        },
        // 选择人员
        evtSelectPerson: () => {
            this.operSelectPerson.show();
        },
        // 系统内添加人员
        evtSysInnerChange: list => {
            this.personListIfy.list = list.map(item => ({
                A01: item,
                name: item.A0101,
                keyId: item[`${this.wfTableCode.getTableCode('A01')}_ID`],
            }));
            this.personListIfy._loadPersonList(true);
        },
        psnDataChange: () => {
            // 人员禁选列表
            return this.personListIfy.list.map(p => p.keyId);
        },
        // 系统外添加人员
        evtSysOutAddPsn: () => {
            this.sysOuterStatus = true;
            this.personListIfy.selectedPsnData = null;
            this.psnBaseInfoIfy.currentTabIndex = this.psnSalaryInfoIfy.currentTabIndex = 0;
            this.loadPersonData();
        },
    };

    @ViewChild('scrollViewPersonList', { static: false })
    private _scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表
     */
    personListIfy = {
        find: {
            placeholder: '请输入姓名关键字搜索',
            value: null,
            nzFilterOption: () => true,
            list: [],
            evtChange: value => {
                const index = this.personListIfy.list.findIndex(item => item.keyId === value);
                if (index > -1) {
                    this._scrollViewPersonList.scrollToIndex(index);
                    this.personListIfy.find.locationSelectPsn(index);
                    // 设置选中
                    this.personListIfy.selectedPsnData = this.personListIfy.list[index];
                    const { pageSize } = this.personListIfy;
                    // 设置搜索人员所在页数
                    const num = Math.trunc((index + 1) / pageSize);
                    const restNum = (index + 1) % pageSize;
                    this.personListIfy.pageIndex = restNum === 0 ? num : num >= 1 ? num + 1 : 1;
                    this.personListIfy.pageChange(false, this.personListIfy.selectedPsnData);
                }
            },
            evtSearch: searchValue => {
                if (searchValue) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.name.indexOf(searchValue) > -1
                    );
                }
            },
            evtOpenChange: status => {
                if (status) {
                    this.personListIfy.find.value = null;
                }
            },
            /**
             * 定位选中人员，滚动至固定位置
             */
            locationSelectPsn: index => {
                setTimeout(() => {
                    const [psn] = this.personListIfy.list[index];
                    const el = <HTMLElement>psn.component.dragElement.nativeElement;
                    this._scrollViewPersonList.scrollToOffset(el.offsetTop);
                }, 300);
            },
        },
        // 切换人员加载附件列表标识
        refreashPsnFile: null,
        /**
         * 当前选中人员
         */
        selectedPsnData: null,
        /**
         * 人员列表总数据
         */
        list: [],
        pageIndex: 1,
        pageSize: 10,
        // 人员选中
        evtSelectedPerson: data => {
            this.sysOuterStatus = false;
            this.personListIfy.selectedPsnData = data;
            this.psnBaseInfoIfy.currentSelectedRow = null;
            this.loadPersonData(true);
            if (this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex].IS_PSN_FILE) {
                // 加载人员附件
                this.personListIfy.refreashPsnFile = +new Date();
            }
        },
        /**
         * 单页人员列表数据
         */
        pagePsnList: [],
        /**
         * 人员列表分页
         */
        pageChange: (reset = false, psn = null) => {
            if (reset) {
                this.personListIfy.pageIndex = 1;
            }
            const { pageSize, pageIndex } = this.personListIfy;
            this.personListIfy.pagePsnList =
                this.personListIfy.list.length > 0
                    ? this.personListIfy.list.slice(
                          pageSize * (pageIndex - 1),
                          pageIndex * pageSize
                      )
                    : [];
            // 选中人员，加载数据
            psn
                ? this.personListIfy.evtSelectedPerson(psn)
                : this.personListIfy.evtSelectedPerson(this.personListIfy.pagePsnList[0]);
        },
        /**
         * 加载人员列表
         */
        _loadPersonList: (isRef = false) => {
            if (this.personListIfy.list.length > 0 && !isRef) {
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.workService.getWfPersonList(this.service.wfId, data).subscribe(result => {
                if (result.length > 0) {
                    this.personListIfy.list = result.map(item => {
                        return {
                            ...item,
                            name: item.A0101,
                            keyId: item[`${this.wfTableCode.getTableCode('A01')}_ID`],
                        };
                    });
                    this.personListIfy.pageChange(true);
                }
            });
        },
        /**
         * 添加人的回调
         */
        increasePsn: value => {
            let psn;
            if (this.sysOuterStatus) {
                // A01新增
                this.personListIfy.list.push(value);
                psn = this.personListIfy.list[this.personListIfy.list.length - 1];
                this.sysOuterStatus = false;
                // 跳转至最后一页
                const { pageSize } = this.personListIfy;
                const rest = this.personListIfy.list.length % pageSize;
                this.personListIfy.pageIndex =
                    rest === 0
                        ? this.personListIfy.list.length / pageSize
                        : Math.trunc(this.personListIfy.list.length / pageSize) + 1;

                this.personListIfy.list = [...this.personListIfy.list];
                this.personListIfy.pageChange(false, psn);
            } else {
                // 修改A01
                const item = this.personListIfy.list.find(v => v.keyId === value.keyId);
                this.personListIfy.list = [...this.personListIfy.list];
                item.name = value.name;
                psn = item;
            }
        },
        /**
         * 撤选
         */
        evtDeletePerson: item => {
            this.personListIfy.find.value = null;
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [item.keyId],
                    };
                    this.workService.deletePerson(this.service.wfId, data).subscribe(() => {
                        // 人员总数据删除撤选人员
                        let delIndex = this.personListIfy.list.findIndex(p => p === item);
                        this.personListIfy.list.splice(delIndex, 1);
                        this.personListIfy.list = [...this.personListIfy.list];
                        // 当前页删除撤选人员
                        const viewIndex = this.personListIfy.pagePsnList.findIndex(p => p === item);
                        this.personListIfy.pagePsnList.splice(viewIndex, 1);

                        // 最后一人时，设为-1
                        if (delIndex === this.personListIfy.list.length) {
                            delIndex--;
                        }
                        // 设置选中
                        this.personListIfy.selectedPsnData =
                            delIndex === -1 ? null : this.personListIfy.list[delIndex];
                        if (this.personListIfy.list.length > 0) {
                            // 当前列表撤完所有人员，跳转上一页
                            if (this.personListIfy.pagePsnList.length === 0) {
                                this.personListIfy.pageIndex--;
                            }
                            this.personListIfy.pageChange(
                                false,
                                this.personListIfy.selectedPsnData
                            );
                        }
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    // 工龄组件
    @ViewChild('StandingChangeComponent', { static: false })
    _standingChangeComponent: CivilStandingChangeComponent;

    /**
     * 人员基本子集
     */
    psnBaseInfoIfy = {
        /**
         * 当前选中子集标签页
         */
        currentTabIndex: 0,
        TABLE_CODE: 'A01',
        list: <any>[
            {
                TABLE_CODE: 'A01',
                TABLE_NAME: '个人信息',
                IS_MAIN: true,
                PSN: true,
            },
            { TABLE_CODE: 'GZ01', TABLE_NAME: '学历情况' },
            { TABLE_CODE: 'GZ02', TABLE_NAME: '任职情况' },
            { TABLE_CODE: 'GZ06', TABLE_NAME: '考核情况' },
            { TABLE_CODE: 'GZ42', TABLE_NAME: '处分情况' },
            { TABLE_CODE: 'GZ09', TABLE_NAME: '高低定情况' },
            { TABLE_CODE: 'GZDA07', TABLE_NAME: '津补贴', IS_Allow: true },
            { TABLE_NAME: '附件材料', IS_PSN_FILE: true },
        ],
        _initFields: () => {
            this.psnBaseInfoIfy.list.forEach(item => {
                item.fields = CivilInnerTransferFields[item.TABLE_CODE];
                item.result = item.PSN ? {} : [];
                item.data = [];
            });
        },
        evtTabChange: () => {
            // 表格子集选中行初始化
            this.psnBaseInfoIfy.currentSelectedRow = null;
            const tab = this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex];
            if (tab.IS_MAIN || tab.IS_Allow) {
                return;
            }
            if (tab.IS_PSN_FILE) {
                // 附件页面 加载人员附件
                this.personListIfy.refreashPsnFile = +new Date();
                return;
            }
            this.psnBaseInfoIfy.pagination.pageChange(true);
        },

        result: null,
        field: null,
        /**
         * 上一个失焦字段信息
         */
        blurField: null,
        // 编辑框
        evtClick: (event, field, result) => {
            if (!this.canEdit) {
                return;
            }
            this.psnBaseInfoIfy.result = result;
            this.psnBaseInfoIfy.field = field;
            if (field.TABLE_COLUMN_DICTIONARY_CODE) {
                this.codeListIfy.codeId = field.TABLE_COLUMN_DICTIONARY_CODE;
                this.codeListIfy.visible = true;
                // 代码项过滤相关初始化
                this.codeListIfy.status = false;
                this.codeListIfy.filterItems = [];
            }
            if (field.TABLE_COLUMN_CODE === 'A0134A' || field.TABLE_COLUMN_CODE === 'A0134B') {
                if (!this.personListIfy.selectedPsnData) {
                    // 没有选中人员
                    return;
                }
                // 工龄字段，弹框另行操作
                this._standingChangeComponent.show();
            } else if (field.TABLE_COLUMN_CODE === 'A0151') {
                // 人员身份代码项过滤
                this.codeListIfy.status = true;
                this.codeListIfy.filterItems = ['01', '02', '03', '04', '0401', '0402'];
            }
        },
        // 输入框失去焦点事件
        evtBlur: (event, field, result) => {
            if (field.TABLE_COLUMN_CODE === 'A0184' && result.A0184) {
                if (!this.workService.reg.IDCardReg.test(result.A0184)) {
                    this.message.error('身份证格式不正确!');
                    return;
                }
                // 校验月份
                let time = {
                    year: '',
                    month: '',
                    day: '',
                };
                switch (result.A0184.length) {
                    case 18:
                        time.year = result.A0184.substr(6, 4);
                        time.month = result.A0184.substr(10, 2);
                        time.day = result.A0184.substr(12, 2);
                        break;
                    default:
                        time.year = `19${result.A0184.substr(6, 2)}`;
                        time.month = result.A0184.substr(8, 2);
                        time.day = result.A0184.substr(10, 2);
                        break;
                }
                if (
                    Number(time.year) / 4 === 0 &&
                    Number(time.year) / 100 !== 0 &&
                    time.month === '02' &&
                    Number(time.day) > 29
                ) {
                    this.message.warning('身份证中出生日期有误!');
                    return;
                    // 闰年
                } else if (time.month === '02' && Number(time.day) > 28) {
                    this.message.warning('身份证中出生日期有误!');
                    return;
                }

                this.psnBaseInfoIfy.idCardToDateAndGender(result);
            }
            if (field.TABLE_COLUMN_CODE === 'A0134' && result.A0134) {
                this.psnBaseInfoIfy.blurField = field;
                // 录完参加工作时间后先保存A01再计算工龄
                this.psnBaseInfoIfy.evtSaveChildData(true);
            }
        },
        evtChange: (item, time) => {
            if (item.IS_CHECK_BIRTG_TIME) {
                const personMain = this.psnBaseInfoIfy.list.find(v => v.TABLE_CODE === 'A01');
                const nowTime = new Date(time).getFullYear();
                const birthTime = new Date(personMain.result.A0107).getFullYear();
                if (nowTime - birthTime <= 0) {
                    this.message.warning('当前时间大于出生时间!');
                }
            }
        },
        /**
         * 身份证号自动生成出生日期与性别
         */
        idCardToDateAndGender: result => {
            let gender;
            switch (result.A0184.length) {
                case 15:
                    result.A0107 = moment('19' + result.A0184.substring(6, 12), 'YYYYMMDD').format(
                        'YYYY-MM-DD'
                    );
                    gender = result.A0184.charAt(14) % 2 === 0 ? '女' : '男';
                    result.A0104_CN = gender;
                    result.A0104 = gender === '男' ? 1 : 2;
                    result['A0107A'] =
                        Number(moment(new Date()).format('YYYY')) -
                        Number(moment(result['A0107']).format('YYYY'));
                    break;
                case 18:
                    result.A0107 = moment(result.A0184.substring(6, 14), 'YYYYMMDD').format(
                        'YYYY-MM-DD'
                    );
                    gender = result.A0184.charAt(16) % 2 === 0 ? '女' : '男';
                    result.A0104_CN = gender;
                    result.A0104 = gender === '男' ? 1 : 2;
                    result['A0107A'] =
                        Number(moment(new Date()).format('YYYY')) -
                        Number(moment(result['A0107']).format('YYYY'));
                    break;
                default:
                    result.A0184 = '';
                    this.message.warning('身份证号输入错误！');
                    break;
            }
        },
        // 增加
        evtAddPsnData: () => {
            const child = this.psnBaseInfoIfy.list.find(
                item =>
                    item.TABLE_CODE ===
                    this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex].TABLE_CODE
            );
            const rowData = {};
            // 构造静态数据
            child.fields.forEach(f => {
                if (f.TABLE_COLUMN_DICTIONARY_CODE) {
                    rowData[f.TABLE_COLUMN_CODE] = '';
                    rowData[`${f.TABLE_COLUMN_CODE}_CN`] = '';
                } else {
                    rowData[f.TABLE_COLUMN_CODE] = '';
                }
            });
            rowData['SYS_SORT'] = child.result.length + 1;
            child.result.push(rowData);
            child.result = [...child.result];
            this.psnBaseInfoIfy.pagination.pageChange();
            this.psnBaseInfoIfy.pagination.loadLastPage();
        },
        // 删除
        evtDeleteData: row => {
            const child = this.psnBaseInfoIfy.list.find(
                item =>
                    item.TABLE_CODE ===
                    this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex].TABLE_CODE
            );
            const index = child.result.indexOf(row);
            const code = this.wfTableCode.getTableCode(child.TABLE_CODE);
            if (!!row[`${code}_ID`]) {
                // 有childId时数据库删除
                const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
                const param = [
                    {
                        jobId,
                        jobStepId,
                        jobDataId,
                        childId: row[`${code}_ID`],
                        keyId: this.personListIfy.selectedPsnData.keyId,
                        changeType: WfDataChangeTypeEnum.DELETE,
                        tableId: code,
                    },
                ];
                this.workService.deleteTableData(param).subscribe();
            }
            // 没有childId时静态删除
            child.result.splice(index, 1);
            child.result = [...child.result];
            this.psnBaseInfoIfy.pagination.pageChange();
            this.psnBaseInfoIfy.pagination.loadLastPage();
        },
        londing: false,
        // 保存
        evtSaveChildData: async (param = false) => {
            const TABLE_CODE =
                this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex].TABLE_CODE;
            const child = this.psnBaseInfoIfy.list.find(item => item.TABLE_CODE === TABLE_CODE);
            if (TABLE_CODE !== 'A01' && !this.personListIfy.selectedPsnData) {
                this.message.warning('请先添加人员主集信息。');
                return;
            } else if (TABLE_CODE === 'A01' && !this.psnBaseInfoIfy.list[0].result.A0101) {
                this.message.warning('请先添加人员主集信息。');
                return;
            } else if (TABLE_CODE !== 'A01' && child.result.length === 0) {
                this.message.warning('请先填写信息。');
                return;
            }

            // 获取子集参数列表
            const params = this.psnBaseInfoIfy.getChangeFieldInfo(child);

            if (child.IS_MAIN) {
                // A01
                // const userInfo: any = await this.commonService.getUserInfoByCache();
                params.data.A0157 = this.userInfo.unitId;
                params.data.A0103 = '01';
                this.psnBaseInfoIfy.londing = true;
                this.service.saveChangeData(params).subscribe(result => {
                    this.psnBaseInfoIfy.londing = false;
                    if (result.code === 0) {
                        this.personListIfy.increasePsn({
                            name: params.data.A0101,
                            keyId: result.data.keyId,
                        });
                        if (
                            this.psnBaseInfoIfy.blurField &&
                            this.psnBaseInfoIfy.blurField.TABLE_COLUMN_CODE === 'A0134' &&
                            param
                        ) {
                            this.conmputeA0134AndA0149();
                        }
                        // 修改工龄弹框内修改数据的标识
                        this._standingChangeComponent.isModifiedData = false;
                        this.isExistNewPerson = +new Date();
                    }
                });
            } else {
                // GZ0904字段数据限制
                if (child.TABLE_CODE === 'GZ09') {
                    if (params.some(item => item.data['GZ0904'] > 10)) {
                        this.message.warning('高低定值过大，请核对！');
                        return;
                    }
                    if (
                        params.some(
                            item =>
                                item.data['GZ0904'] <= 0 ||
                                Math.trunc(item.data['GZ0904']) - item.data['GZ0904'] !== 0
                        )
                    ) {
                        this.message.warning('高低定值应为正整数！');
                        return;
                    }
                }
                this.psnBaseInfoIfy.londing = true;
                this.service.batchSpecialSave(params).subscribe(result => {
                    this.psnBaseInfoIfy.londing = false;
                    if (result) {
                        this.sysOuterStatus = false;
                        this.psnBaseInfoIfy.updatePsnChilds(TABLE_CODE);
                    }
                });
            }
        },
        /**
         * 构造子集字段参数
         */
        getChangeFieldInfo: child => {
            const tableId = `${this.wfTableCode.getTableCode(child.TABLE_CODE)}_ID`;
            const codes = Object.keys(child.result);
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const params: any = {
                jobId,
                jobStepId,
                jobDataId,
                tableId: `${this.wfTableCode.getTableCode(child.TABLE_CODE)}`,
            };
            if ((this.sysOuterStatus || child.IS_MAIN) && child.result['A0184']) {
                // 保存A01时，校验身份证号有效性
                if (!this.workService.reg.IDCardReg.test(child.result['A0184'])) {
                    this.message.error('身份证不合法。');
                    return;
                }
            }

            const paramsArr = [];
            const fieldData = {};
            if (this.sysOuterStatus) {
                // 新增A01
                child.fields.forEach(f => {
                    const ele = codes.find(item => item === f.TABLE_COLUMN_CODE);
                    fieldData[ele] = child.result[ele];
                });
                params.changeType = 0;
                params.childId = '-1';
                params.data = fieldData;
                params.keyId = '';
            } else {
                if (child.IS_MAIN) {
                    // 编辑A01
                    child.fields.forEach(f => {
                        const ele = codes.find(item => item === f.TABLE_COLUMN_CODE);
                        fieldData[ele] = child.result[ele];
                    });
                    params.changeType = 1;
                    params.data = fieldData;
                    params.keyId = this.personListIfy.selectedPsnData.keyId;
                } else {
                    // 编辑除A01外的其它子集
                    child.result.forEach(item => {
                        if (child.TABLE_CODE === 'GZ02') {
                            this.psnBaseInfoIfy.setGZ0232Value(item);
                        }
                        // changeType：0新增，1编辑，2删除
                        const DATA = {
                            ...params,
                            keyId: this.personListIfy.selectedPsnData.keyId,
                            changeType: item[tableId] ? 1 : 0,
                            childId: item[tableId] ? item[tableId] : '-1',
                            data: item,
                        };
                        // 新增的子集条目删除SYS_SORT
                        if (DATA.changeType === 0) {
                            delete DATA.data.SYS_SORT;
                        }
                        paramsArr.push(DATA);
                    });
                    return paramsArr;
                }
            }
            return params;
        },
        // 根据GZ0232值为GZ0226，GZ0201赋值
        setGZ0232Value: item => {
            if (!item.GZ0232) {
                return;
            }
            switch (item.GZ0232.substring(0, 2)) {
                case '01':
                    item['GZ0226'] = '01';
                    item['GZ0201'] = '01';
                    break;
                case '02':
                    item['GZ0226'] = '07';
                    item['GZ0201'] = '02';
                    break;
                case '03':
                    item['GZ0226'] = '05';
                    item['GZ0201'] = '03';
                    break;
                case '04':
                    item['GZ0226'] = '06';
                    item['GZ0201'] = '04';
                    break;
                case '05':
                    item['GZ0226'] = '09';
                    item['GZ0201'] = '05';
                    break;
                case '07':
                    item['GZ0226'] = '01';
                    item['GZ0201'] = '07';
                    break;
                case '08':
                    item['GZ0226'] = '01';
                    item['GZ0201'] = '08';
                    break;
            }
        },
        /**
         * 保存后刷新除A01外的子集
         */
        updatePsnChilds: TABLE_CODE => {
            const { jobId, jobStepId, wfId } = this.jobStepInfo;
            const paramd = {
                jobId,
                jobStepId,
                wfId,
            };
            this.workService
                .getwfPersonDataList(
                    paramd,
                    this.personListIfy.selectedPsnData.keyId,
                    `${this.wfTableCode.getTableCode(TABLE_CODE)}`
                )
                .subscribe(result => {
                    this.psnBaseInfoIfy._buildUpdatePsnChilds(result);
                });
        },
        // 构造数据
        _buildUpdatePsnChilds: result => {
            const table = this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex];
            if (table.IS_MAIN && table.PSN) {
                table.fields.forEach(v => {
                    this.setA01FieldsValue(v, result[0]);
                });
                table.result = result[0] || {};
            } else {
                table.fields.forEach(f => {
                    result.forEach(item => {
                        this.formatDataField(f, item);
                    });
                });
                table.result = result;
                if (table.TABLE_CODE === 'GZ01' || table.TABLE_CODE === 'GZ02') {
                    // 更新A01的学历和任职信息字段数据
                    const childA01 = this.psnBaseInfoIfy.list.find(
                        item => item.TABLE_CODE === 'A01'
                    );
                    const gz01 = this.psnBaseInfoIfy.list
                        .find(item => item.TABLE_CODE === 'GZ01')
                        .result.find(d => d.IS_LAST_ROW);
                    const gz02 = this.psnBaseInfoIfy.list
                        .find(item => item.TABLE_CODE === 'GZ02')
                        .result.find(d => d.IS_LAST_ROW);
                    childA01.result['GZ0101'] = gz01 ? gz01.GZ0101 : '';
                    childA01.result['GZ0101_CN'] = gz01 ? gz01.GZ0101_CN : '';
                    childA01.result['GZ0201'] = gz02 ? gz02.GZ0201 : '';
                    childA01.result['GZ0201_CN'] = gz02 ? gz02.GZ0201_CN : '';
                }
                this.psnBaseInfoIfy.pagination._initPage();
            }
        },
        /**
         * 当前表格选中行
         */
        currentSelectedRow: null,
        // 选中行
        selectedRow: data => {
            this.psnBaseInfoIfy.currentSelectedRow = data;
        },
        // 上下移
        moveSelectedTableRow: type => {
            if (!this.psnBaseInfoIfy.currentSelectedRow) {
                this.message.warning('请先选中数据行。');
                return;
            }
            const table = this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex];
            let selectedIndex = table.result.indexOf(this.psnBaseInfoIfy.currentSelectedRow);
            if (type === 'up' && selectedIndex === 0) {
                this.message.warning('当前已是第一行，无法上移。');
                return;
            } else if (type !== 'up' && selectedIndex === table.result.length - 1) {
                this.message.warning('当前已是最后一行，无法下移。');
                return;
            }
            // 数据行赋值
            const goalIndex = type === 'up' ? selectedIndex - 1 : selectedIndex + 1;
            table.result[selectedIndex] = table.result[goalIndex];
            table.result[goalIndex] = this.psnBaseInfoIfy.currentSelectedRow;
            type === 'up' ? selectedIndex-- : selectedIndex++;
            // 对SYS_SORT排序
            table.result.map((item, i) => {
                item.SYS_SORT = i + 1;
            });
            // 设置选中行
            this.psnBaseInfoIfy.currentSelectedRow = table.result[selectedIndex];
            const { pageSize } = this.psnBaseInfoIfy.pagination;
            // 移动到上一页或下一页跳转页面
            if (type === 'up' && selectedIndex % pageSize === pageSize - 1) {
                this.psnBaseInfoIfy.pagination.pageIndex--;
            } else if (type === 'down' && selectedIndex % pageSize === 0) {
                this.psnBaseInfoIfy.pagination.pageIndex++;
            }
            // 数据分页
            this.psnBaseInfoIfy.pagination._initPage();
        },
        pagination: {
            _initPage: () => {
                const { pageSize, pageIndex } = this.psnBaseInfoIfy.pagination;
                const item = this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex];
                if (item.IS_MAIN) {
                    return;
                }
                this.psnBaseInfoIfy.pagination.total = item.result.length;
                item.data =
                    item.result.length > 0
                        ? item.result.slice(pageSize * (pageIndex - 1), pageIndex * pageSize)
                        : [];
                this.cdr.detectChanges();
            },
            pageIndex: 1,
            pageSize: 5,
            total: 0,
            /**
             * 基本子集数据分页
             */
            pageChange: (reset = false) => {
                if (reset) {
                    this.psnBaseInfoIfy.pagination.pageIndex = 1;
                }
                this.psnBaseInfoIfy.pagination._initPage();
            },
            /**
             * 是否跳转至上一页或下一页
             */
            loadLastPage: () => {
                const { pageSize, pageIndex } = this.psnBaseInfoIfy.pagination;
                const item = this.psnBaseInfoIfy.list[this.psnBaseInfoIfy.currentTabIndex];
                const _pageIndex = parseInt(
                    ((item.result.length + pageSize - 1) / pageSize).toString()
                );
                if (_pageIndex !== pageIndex) {
                    this.psnBaseInfoIfy.pagination.pageIndex = _pageIndex;
                    this.psnBaseInfoIfy.pagination.pageChange();
                }
            },
        },
    };

    /**
     * 工资子集
     */
    psnSalaryInfoIfy = {
        currentTabIndex: 0,
        TABLE_CODE: 'GZDA07',
        list: <any>[
            {
                TABLE_CODE: 'GZDA07',
                TABLE_NAME: '现执行工资',
                IS_MAIN: false,
                PSN: true,
            },
            { TABLE_CODE: 'GZ07', TABLE_NAME: '工资变迁' },
            { TABLE_CODE: 'GZ10', TABLE_NAME: '套改情况' },
        ],
        _initFields: () => {
            this.psnSalaryInfoIfy.list.forEach(item => {
                item.fields = CivilInnerTransferFields[item.TABLE_CODE];
                item.result = item.PSN ? {} : [];
            });
        },
        evtTabChange: () => {
            this.psnSalaryInfoIfy.pagination.pageChange(true);
        },
        /**
         * 核定工资后需要刷新津补贴
         */
        isUpdateAllow: 0,
        /**
         * 核定工资后刷新工资子集和GZ02
         */
        updateSalaryChilds: () => {
            const { jobId, jobStepId } = this.jobStepInfo;
            const childFields = {};
            let childLists = [];
            childLists.push(this.psnBaseInfoIfy.list.find(item => item.TABLE_CODE === 'GZ02'));
            childLists = childLists.concat(this.psnSalaryInfoIfy.list);
            childLists.forEach(
                t => (childFields[`${this.wfTableCode.getTableCode(t.TABLE_CODE)}`] = [])
            );
            const paramd = {
                jobId,
                jobStepId,
                keyIds: [this.personListIfy.selectedPsnData.keyId],
                childFields,
            };
            this.workService.getPsnList(this.service.wfId, paramd).subscribe(result => {
                if (result) {
                    this.psnSalaryInfoIfy._buildUpdateSalaryChilds(result, childLists);
                }
            });
        },
        // 构造数据
        _buildUpdateSalaryChilds: (result, childLists) => {
            childLists.forEach(table => {
                const childInfo = result[`${this.wfTableCode.getTableCode(table.TABLE_CODE)}`];
                if (table.PSN) {
                    // GZDA07子集
                    if (childInfo) {
                        const personInfo = childInfo.find(v => v.IS_LAST_ROW);
                        table.fields.forEach(v => {
                            this.formatDataField(v, personInfo);
                            this.setGZDA07FieldsValue(v, personInfo);
                        });
                        table.result = personInfo || {};
                    }
                } else {
                    // 非GZDA07子集
                    if (childInfo) {
                        table.fields.forEach(f => {
                            childInfo.forEach(item => {
                                this.formatDataField(f, item);
                            });
                        });
                    }
                    table.result = childInfo || [];

                    this.psnBaseInfoIfy.pagination.pageChange(true);
                    this.psnSalaryInfoIfy.pagination.pageChange(true);
                }
            });
        },
        pagination: {
            _initPage: () => {
                const { pageSize, pageIndex } = this.psnSalaryInfoIfy.pagination;
                const item = this.psnSalaryInfoIfy.list[this.psnSalaryInfoIfy.currentTabIndex];
                if (item.PSN) {
                    return;
                }
                this.psnSalaryInfoIfy.pagination.total = item.result.length;
                item.data =
                    item.result.length > 0
                        ? item.result.slice(pageSize * (pageIndex - 1), pageIndex * pageSize)
                        : [];
                this.cdr.detectChanges();
            },
            pageIndex: 1,
            pageSize: 5,
            total: 0,
            /**
             * 工资子集数据分页
             */
            pageChange: (reset = false) => {
                if (reset) {
                    this.psnSalaryInfoIfy.pagination.pageIndex = 1;
                }
                this.psnSalaryInfoIfy.pagination._initPage();
            },
        },
    };

    /**
     * 代码框
     */
    codeListIfy = {
        codeId: null,
        text: null,
        value: null,
        visible: false,
        evtTextChange: () => {
            if (this.batchGZ06DrawerIfy.visible) {
                this.batchGZ06DrawerIfy.form.patchValue({ examResult: this.codeListIfy.value });
                this.batchGZ06DrawerIfy.GZ0602 = this.codeListIfy.value;
                return;
            }
            this.psnBaseInfoIfy.result[`${this.psnBaseInfoIfy.field.TABLE_COLUMN_CODE}_CN`] =
                this.codeListIfy.text;
            this.psnBaseInfoIfy.result[this.psnBaseInfoIfy.field.TABLE_COLUMN_CODE] =
                this.codeListIfy.value;
        },
        // 过滤
        status: false,
        filterItems: [],
    };

    /**
     * 批量审核抽屉
     */
    batchGZ06DrawerIfy = {
        GZ0602: null,
        visible: false,
        open: () => {
            if (!this.personListIfy.selectedPsnData) {
                this.message.warning('请先添加人员。');
                return;
            }
            this.batchGZ06DrawerIfy.visible = true;
        },
        close: () => {
            this.batchGZ06DrawerIfy.form.reset();
            this.batchGZ06DrawerIfy.visible = false;
        },
        form: new FormGroup({
            startYear: new FormControl(null, Validators.required),
            endYear: new FormControl(null, Validators.required),
            examResult: new FormControl(null, Validators.required),
        }),
        save: () => {
            if (!this.workService.formVerify(this.batchGZ06DrawerIfy.form)) {
                return;
            }
            const formData = this.batchGZ06DrawerIfy.form.getRawValue();
            if (Number(formData.startYear) < Number(2006)) {
                this.message.warning('起始年度必须大于等于2006年。');
                return;
            }
            formData.examResult = this.batchGZ06DrawerIfy.GZ0602;
            const { jobId, jobStepId } = this.jobStepInfo;
            const params = {
                jobId,
                jobStepId,
                keyId: this.personListIfy.selectedPsnData.keyId,
                ...formData,
            };
            this.service.batchSaveGz06Data(params).subscribe(() => {
                this.psnBaseInfoIfy.updatePsnChilds('GZ06');
                this.batchGZ06DrawerIfy.close();
            });
        },
        evtClick: () => {
            this.codeListIfy.codeId = 'CGZCC';
            this.codeListIfy.visible = true;
        },
        evtBlur: (name, value) => {
            if (value && moment(value, 'YYYY').isValid()) {
                // 时间数据是否有效，有效将其格式化
                value = moment(value, 'YYYY').format('YYYY');
                this.batchGZ06DrawerIfy.form.get(name).setValue(value);
            } else {
                this.batchGZ06DrawerIfy.form.get(name).setValue(null);
            }
        },
    };

    /**
     * 数据校验内容显示
     */
    dataVerificationIfy = {
        visible: false,
        width: 500,
        close: () => (this.dataVerificationIfy.visible = false),
        open: () => (this.dataVerificationIfy.visible = true),
        list: [],
    };

    // 流程图与流程监控抽屉
    @ViewChild('wfInfoDrawerElement', { static: false })
    _wfInfoDrawerElement: CivilInnerTransferDrawerComponent;

    wfInfoDrawer = {
        changeStatus: null,
        sign: null,
        // 用参数来区分打开流程图抽屉与打开流程监控抽屉
        show: param => {
            this.wfInfoDrawer.sign = param;
            this.wfInfoDrawer.changeStatus = +new Date();
            // this._wfInfoDrawerElement.show();
        },
    };

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
        this.psnBaseInfoIfy._initFields();
        this.psnSalaryInfoIfy._initFields();
    }

    ngAfterViewInit() {}

    /**
     * 核定工资
     */
    async checkSalary() {
        if (!this.personListIfy.selectedPsnData) {
            this.message.warning('请先选择人员。');
            return;
        }
        // 数据校验
        const pd = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personListIfy.selectedPsnData.keyId],
        };
        const list = await this.workService.dataVerification(pd).toPromise();
        if (!list || list.length > 0) {
            this.dataVerificationIfy.list = list;
            this.dataVerificationIfy.open();
            return;
        }

        const _loading = this.loading.show();
        const { jobId, jobStepId } = this.jobStepInfo;
        const params = {
            jobId,
            jobStepId,
            handlerIds: ['601'],
            keyIds: [this.personListIfy.selectedPsnData.keyId],
        };
        this.workService.salaryCivilCalculation(params).subscribe(result => {
            _loading.close();
            if (result) {
                this.psnSalaryInfoIfy.updateSalaryChilds();
                // 需要刷新津补贴表格
                this.psnSalaryInfoIfy.isUpdateAllow = +new Date();
            }
        });
    }

    /**
     * 录参公时间A0134后
     * 计算工龄A0134A和连续工龄起算时间A0149
     */
    conmputeA0134AndA0149() {
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personListIfy.selectedPsnData.keyId],
        };
        this.service.computeYear(params).subscribe(result => {
            const table = this.psnBaseInfoIfy.list.find(d => d.TABLE_CODE === 'A01');
            table.result.A0134A = result.data.A0134A;
            table.result.A0134B = result.data.A0134B;
            table.result.A0149 = result.data.A0149;
        });
    }

    /**
     * 加载所有子集数据
     */
    loadPersonData(isRef = false) {
        if (!this.personListIfy.selectedPsnData) {
            // 没有选中人员时，清空所有子集数据
            const tableLists = this.psnBaseInfoIfy.list.concat(this.psnSalaryInfoIfy.list);
            tableLists.forEach(item => {
                item.result = item.PSN ? {} : [];
            });
            return;
        }
        if (!isRef) {
            this.buildSetChildData();
            return;
        }
        const childFields = {};
        this.childIds.forEach(v => (childFields[`${this.wfTableCode.getTableCode(v)}`] = []));
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personListIfy.selectedPsnData.keyId],
            childFields,
        };
        this.workService.getPsnList(this.service.wfId, params).subscribe(result => {
            this.allChildsDatas = result;
            this.buildSetChildData();
        });
    }

    /**
     * 处理构造子集数据
     */
    buildSetChildData() {
        const tableLists = this.psnBaseInfoIfy.list.concat(this.psnSalaryInfoIfy.list);
        tableLists.forEach(table => {
            const child = this.allChildsDatas[`${this.wfTableCode.getTableCode(table.TABLE_CODE)}`];
            // 主集A01
            if (table.IS_MAIN && table.PSN) {
                if (child && child.length > 0) {
                    table.fields.forEach(v => {
                        this.setA01FieldsValue(v, child[0]);
                    });
                }
                table.result = child[0] || {};
            }

            // 子集最后一条
            if (!table.IS_MAIN && table.PSN) {
                if (child) {
                    const personInfo = child.find(f => f.IS_LAST_ROW);
                    table.fields.forEach(v => {
                        this.formatDataField(v, personInfo);
                        if (table.TABLE_CODE === 'GZDA07') {
                            this.setGZDA07FieldsValue(v, personInfo);
                        }
                    });
                    table.result = personInfo || {};
                } else {
                    table.result = {};
                }
            }

            // 子集所有数据
            if (!table.PSN) {
                if (child) {
                    table.fields.forEach(f => {
                        child.forEach(item => {
                            this.formatDataField(f, item);
                        });
                    });
                }
                table.result = child || [];
                this.psnBaseInfoIfy.pagination.pageChange(true);
                this.psnSalaryInfoIfy.pagination.pageChange(true);
            }
        });
    }

    /**
     * 设置字段数据
     */
    setA01FieldsValue(field, data) {
        this.formatDataField(field, data);
        switch (field.TABLE_COLUMN_CODE) {
            case 'A0157':
                data['A0157'] = this.userInfo.unitId;
                data['A0157_CN'] = this.userInfo.unitName;
                break;
            case 'A0107A':
                if (data['A0107']) {
                    data['A0107A'] =
                        Number(moment(new Date()).format('YYYY')) -
                        Number(moment(data['A0107']).format('YYYY'));
                }
                break;
            case 'GZ0101':
                if (this.allChildsDatas[this.wfTableCode.getTableCode('GZ01')]) {
                    const gz01 = this.allChildsDatas[this.wfTableCode.getTableCode('GZ01')].find(
                        f => f.IS_LAST_ROW
                    );
                    data['GZ0101'] = gz01 ? gz01.GZ0101 : '';
                    data['GZ0101_CN'] = gz01 ? gz01.GZ0101_CN : '';
                }
                break;
            case 'GZ0201':
                if (this.allChildsDatas[this.wfTableCode.getTableCode('GZ02')]) {
                    const gz02 = this.allChildsDatas[this.wfTableCode.getTableCode('GZ02')].find(
                        d => d.IS_LAST_ROW
                    );
                    // allChildsDatas中没有子集数据时find方法报错
                    data['GZ0201'] = gz02 ? gz02.GZ0201 : '';
                    data['GZ0201_CN'] = gz02 ? gz02.GZ0201_CN : '';
                }
                break;
            default:
                break;
        }
    }

    /**
     * 设置GZDA07字段数据
     */
    setGZDA07FieldsValue(field, data) {
        if (data) {
            switch (field.TABLE_COLUMN_CODE) {
                case 'GZDA0725':
                    data['GZDA0725'] = data['GZDA0725'] === '0' ? '' : data['GZDA0725'];
                    break;
                case 'GZDA0726':
                    data['GZDA0726'] = data['GZDA0726'] === '0' ? '' : data['GZDA0726'];
                    break;
            }
        }
    }

    /**
     * 时间数据是否有效，有效将其格式化
     */
    formatDataField(field, data) {
        if (field.TABLE_COLUMN_TYPE === ColumnTypeEnum.DATE) {
            if (data && moment(data[field.TABLE_COLUMN_CODE], 'YYYYMMDD').isValid()) {
                // 时间数据是否有效，有效将其格式化
                data[field.TABLE_COLUMN_CODE] = moment(
                    data[field.TABLE_COLUMN_CODE],
                    'YYYYMMDD'
                ).format('YYYY-MM-DD');
            }
        }
        return data;
    }

    // 全屏事件
    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
        // 全屏开启时表格数据以10分页，关闭时以5分页
        this.psnBaseInfoIfy.pagination.pageSize = this.isFullScreen ? 10 : 5;
        this.psnBaseInfoIfy.pagination.pageChange(true);
        this.psnSalaryInfoIfy.pagination.pageSize = this.isFullScreen ? 10 : 5;
        this.psnSalaryInfoIfy.pagination.pageChange(true);
    }
}
