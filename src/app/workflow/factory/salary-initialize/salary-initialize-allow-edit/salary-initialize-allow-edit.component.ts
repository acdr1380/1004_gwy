import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';

import * as moment from 'moment';
import { AllowFields } from '../salary-initialize-allowance-field/fields';
import { NzModalService } from 'ng-zorro-antd/modal';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { SalaryInitializeService } from '../salary-initialize.service';
import { LoadingService } from 'app/components/loading/loading.service';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'salary-initialize-allow-edit',
    templateUrl: './salary-initialize-allow-edit.component.html',
    styleUrls: ['./salary-initialize-allow-edit.component.scss'],
})
export class SalaryInitializeAllowEditComponent implements OnInit {
    constructor(
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private parentService: SalaryInitializeService,
        private wfTableCode: WfTableHelper,
        private loading: LoadingService
    ) { }

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
            this._jobStepInfo = v;
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /**
     * 业务信息
     */
    _personKeyId: any;
    @Input()
    set personKeyId(v) {
        if (v) {
            this._personKeyId = v;
        }
    }
    get personKeyId() {
        return this._personKeyId;
    }

    /**
     * 表格数据是否可编辑
     */
    disable: Boolean = false;

    /**
     * 点击表格弹出对应弹窗的标志
     */
    _status;
    @Input() set status(data) {
        this._status = data;
        if (data) {
            const { TABLE_COLUMN_NAME, IS_SHOW_TYPE, SHOW_TABLE_TYPE } = data;
            // 标准类型（IS_SHOW_TYPE = 1）只读，计算类型（IS_SHOW_TYPE = 0）可编辑
            this.disable = !!IS_SHOW_TYPE;
            this.editDrawer.title = TABLE_COLUMN_NAME;
            // 只有GZDA07C61和GZDA07B01两个字段时才显示另外一个GZ21A子集表格
            this.editDrawer.isShowGZ21ATable = SHOW_TABLE_TYPE;

            // 根据不同津补贴字段设置表格列头显示字段
            this.handleHeadLists();
            this.editDrawer.widthConfig = Array(this.editDrawer.headerList.length + 1).fill(
                '130px'
            );
            this.editDrawer.scrollConfig.x = (this.editDrawer.headerList.length + 1) * 100 + 'px';
            this.getWfData();
        }
    }
    get status() {
        return this._status;
    }

    @Output() calculateChange = new EventEmitter<any>();

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 编辑抽屉
     */
    editDrawer = {
        /**
         * 是否显示GZ21A表格
         */
        isShowGZ21ATable: null,
        visible: false,
        loading: false,
        width: 700,
        data: [],
        totalData: null,
        title: '',
        selectIndex: -1,
        headerList: [],
        widthConfig: [],
        scrollConfig: { x: '600px', y: '500px' },
        headArr: null,
        open: () => (this.editDrawer.visible = true),
        close: () => (this.editDrawer.visible = false),
        // 保存
        saveAllowanceTable: () => {
            this.editDrawer.loading = true;
            const saveData = this.editDrawer.data.filter(
                v => v.changeState === 0 || v.changeState === 1
            );
            const { TABLE_COLUMN_CODE, SON_TABLE_FIELD } = this.status;
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const paramsArr = [];
            saveData.map(v => {
                if (SON_TABLE_FIELD === 'GZ21A') {
                    // 编辑GZ21A表格数据时，同步设置保存GZ21A03字段
                    v.GZ21A03 = TABLE_COLUMN_CODE.substring(6);
                }
                const params = {
                    keyId: this.personKeyId,
                    childId: v.childId ? v.childId : -1,
                    jobId,
                    jobStepId,
                    jobDataId,
                    changeType: v.childId ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                    tableId: this.wfTableCode.getTableCode(SON_TABLE_FIELD),
                    data: v,
                };
                paramsArr.push(params);
            });
            if (this.status.IS_SPECILA_SAVE) {
                this.parentService.allowSyncSave(paramsArr).subscribe(result => {
                    this.editDrawer.loading = false;
                    this.getWfData();
                });
                return;
            }
            this.workflowService.saveMultipleTableData(paramsArr).subscribe(result => {
                this.editDrawer.loading = false;
                this.getWfData();
            });
        },
        // 删除
        deleteData: data => {
            if (!!data.childId) {
                this.modalService.confirm({
                    nzTitle: '系统提示?',
                    nzContent: `<b style="color: red;">确定要删除当前这条记录吗？</b>`,
                    nzOkText: '确定',
                    nzOkType: 'danger',
                    nzOnOk: () => {
                        const { SON_TABLE_FIELD } = this.status;
                        const tableId = this.wfTableCode.getTableCode(SON_TABLE_FIELD);
                        const dataArray = [
                            {
                                childId: data.childId,
                                keyId: this.personKeyId,
                                jobId: this.jobStepInfo.jobId,
                                jobStepId: this.jobStepInfo.jobStepId,
                                jobDataId: this.jobStepInfo.jobDataId,
                                changeType: WfDataChangeTypeEnum.DELETE,
                                tableId: tableId,
                            },
                        ];
                        this.workflowService.deleteTableData(dataArray).subscribe(() => { });
                    },
                    nzCancelText: '取消',
                    nzOnCancel: () => console.log('Cancel'),
                });
            }
            // 没有childId时静态删除
            const index = this.editDrawer.data.indexOf(data);
            this.editDrawer.data.splice(index);
            this.editDrawer.data = [...this.editDrawer.data];
        },
        /**
         * 计算
         */
        calculation: async () => {
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [this.personKeyId],
            };
            // 数据校验
            const list = await this.workflowService.dataVerification(params).toPromise();
            if (!list || list.length > 0) {
                this.dataVerificationIfy.list = list;
                this.dataVerificationIfy.open();
                return;
            }
            const _loading = this.loading.show();
            const par = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                handlerIds: ['601'],
                keyIds: [this.personKeyId],
            };
            this.workflowService.salaryCalculation(par).subscribe(result => {
                _loading.close();
                if (result) {
                    this.calculateChange.emit();
                    this.editDrawer.totalData = null;
                    this.getWfData();
                }
            });
        },
        // 添加
        add: () => {
            const obj = { changeState: 0 };
            this.editDrawer.headerList.forEach(v => {
                obj[v.TABLE_COLUMN_CODE] = '';
            });
            this.editDrawer.data.push(obj);
            this.editDrawer.data = [...this.editDrawer.data];
        },
    };

    /**
     * 只在GZDA07C61和GZDA07B01两个字段时显示的GZ21A单独表格，只读不编辑
     */
    gz21ATable = {
        visible: false,
        width: 600,
        data: [],
        open: () => (this.gz21ATable.visible = true),
        close: () => (this.gz21ATable.visible = false),
        // 添加
        addDataRow: () => {
            this.gz21ATable.data = [
                ...this.gz21ATable.data,
                {
                    GZ21A01: '',
                    GZ21A02: '',
                    GZ21A04: '',
                },
            ];
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

    ngOnInit() { }

    // 显示
    show() {
        this.editDrawer.open();
    }
    /**
     * 获取子集数据
     */
    getWfData() {
        if (!this.status) {
            return;
        }
        this.editDrawer.loading = true;
        const { SON_TABLE_FIELD, TABLE_COLUMN_CODE } = this.status;
        const tableId = this.wfTableCode.getTableCode(SON_TABLE_FIELD);
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            childFields: {
                [tableId]: [],
            },
            keyIds: [this.personKeyId],
        };
        if (this.editDrawer.isShowGZ21ATable) {
            // 显示GZ21A单独表格时增加子集参数
            data.childFields[this.wfTableCode.getTableCode('GZ21A')] = [];
        }
        const dateTime = this.editDrawer.headerList.filter(v => v.TABLE_COLUMN_TYPE === 4);
        this.workflowService.getPsnList(this.parentService.wfId, data).subscribe(result => {
            this.editDrawer.loading = false;
            if (result[tableId]) {
                // 全部数据
                this.editDrawer.data = result[tableId].map(v => {
                    v.childId = v[`${tableId}_ID`];
                    dateTime.forEach(item => {
                        this.formatDataField(item, v);
                    });
                    return v;
                });
                if (SON_TABLE_FIELD === 'GZ21A') {
                    // 表格显示为GZ21A子集时，用GZ21A03字段过滤子集数据
                    this.editDrawer.data = this.editDrawer.data.filter(
                        v => v.GZ21A03 === TABLE_COLUMN_CODE.substring(6)
                    );
                }
            } else {
                this.editDrawer.data = [];
            }

            // 只在GZDA07C61和GZDA07B01两个字段时显示的GZ21A单独表格
            if (
                this.editDrawer.isShowGZ21ATable &&
                result[this.wfTableCode.getTableCode('GZ21A')]
            ) {
                // GZ21A表格只显示津补贴字段与GZ21A03对应的数据
                this.gz21ATable.data = result[`${this.wfTableCode.getTableCode('GZ21A')}`].filter(
                    v => v.GZ21A03 === TABLE_COLUMN_CODE.substring(6)
                );
                this.gz21ATable.data.map(data => {
                    this.formatDataField(
                        { TABLE_COLUMN_TYPE: 4, TABLE_COLUMN_CODE: 'GZ21A01' },
                        data
                    );
                    this.formatDataField(
                        { TABLE_COLUMN_TYPE: 4, TABLE_COLUMN_CODE: 'GZ21A02' },
                        data
                    );
                    return data;
                });
            } else {
                this.gz21ATable.data = [];
            }
        });
    }

    handleHeadLists() {
        // 设置表格表头显示字段
        const { TABLE_COLUMN_CODE, SON_TABLE_FIELD } = this.status;
        switch (TABLE_COLUMN_CODE) {
            case 'GZDA07B05':
            case 'GZDA07B06':
            case 'GZDA07B07':
                this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD].filter(
                    v => v.TABLE_COLUMN_CODE !== 'GZ21A04'
                );
                break;
            case 'GZDA07B03':
            case 'GZDA07C61':
            case 'GZDA07B01':
                this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD];
                break;
            default:
                this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD].filter(
                    v => v.TABLE_COLUMN_CODE !== 'GZ21A07'
                );
                break;
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
}
