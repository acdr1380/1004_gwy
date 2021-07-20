import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';

import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import * as moment from 'moment';
import { AllowFields } from '../career-allowance-field/fields';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'allow-edit',
    templateUrl: './career-allow-edit.component.html',
    styleUrls: ['./career-allow-edit.component.scss'],
    providers: [WfTableHelper],
})
export class CareerAllowEditComponent implements OnInit {
    constructor(
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private tableHelper: WfTableHelper
    ) { }
    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /**
     * 业务信息
     */
    _person: any;
    @Input()
    set person(v) {
        if (v) {
            this._person = v;
            this.getWfData();
        }
    }
    get person() {
        return this._person;
    }

    /**
     * 点击表格弹出对应弹窗的标志
     */
    _status;
    @Input() set status(data) {
        this._status = data;
        if (data) {
            const { TABLE_COLUMN_NAME, SON_TABLE_FIELD, IS_SHOW_TYPE, TABLE_COLUMN_CODE, SHOW_TABLE_TYPE } = data;
            // 标准类型（IS_SHOW_TYPE = 1）只读，计算类型（IS_SHOW_TYPE = 0）可编辑
            this.disable = !!IS_SHOW_TYPE;
            this.editDrawer.title = TABLE_COLUMN_NAME;

            // 只有GZDA07C61和GZDA07B01两个字段时才显示另外一个GZ21A子集表格
            this.editDrawer.isShowGZ21ATable = SHOW_TABLE_TYPE;

            if (IS_SHOW_TYPE) {
                this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD];
            } else {
                switch (TABLE_COLUMN_CODE) {
                    // 驾驶员津贴，特教津贴，军队服务津贴时显示GZ21A07，不显示GZ21A04
                    case 'GZDA07B05':
                    case 'GZDA07B06':
                    case 'GZDA07D07':
                        this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD].filter(
                            v => (!v.IS_STANDARD || v.TABLE_COLUMN_CODE === 'GZ21A07') && v.TABLE_COLUMN_CODE !== 'GZ21A04'
                        );
                        break;
                    default:

                        this.editDrawer.headerList = AllowFields[SON_TABLE_FIELD].filter(
                            v => !v.IS_STANDARD
                        );
                        break;
                }
            }
            this.editDrawer.widthConfig = Array(this.editDrawer.headerList.length).fill('120px');
            this.editDrawer.widthConfig.push('100px');
            this.editDrawer.scrollConfig.x = (this.editDrawer.headerList.length + 1) * 100 + 'px';
            this.getWfData();
        }
    }
    get status() {
        return this._status;
    }
    disable: Boolean = false;

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
        width: 600,
        data: [],
        totalData: null,
        title: '',
        selectIndex: -1,
        headerList: [],
        widthConfig: [],
        scrollConfig: { x: '0px', y: '450px' },
        open: () => {
            this.editDrawer.visible = true;
        },
        close: () => {
            this.editDrawer.visible = false;
            // this.calculateChange.emit();
        },
        // 保存
        saveAllowanceTable: () => {
            this.editDrawer.loading = true;
            const saveData = this.editDrawer.data.filter(
                v => v.changeState === 0 || v.changeState === 1
            );
            const { TABLE_COLUMN_CODE, SON_TABLE_FIELD } = this.status;
            const paramsArr = [];

            saveData.map(v => {
                if (SON_TABLE_FIELD === 'GZ21A') {
                    v.GZ21A03 = TABLE_COLUMN_CODE.substr(6);
                }
                const params = {
                    keyId: this.person.keyId,
                    childId: v.childId ? v.childId : -1,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: v.childId ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                    tableId: `${this.tableHelper.getTableCode(SON_TABLE_FIELD)}`,
                    data: v,
                };
                paramsArr.push(params);
            });
            this.workflowService.saveMultipleTableData(paramsArr).subscribe(result => {
                this.editDrawer.loading = false;
                this.getWfData();
            });
        },

        // 删除
        deleteData: (data, index) => {
            if (!data.childId) {
                this.editDrawer.data.splice(index, 1);
                this.editDrawer.data = [...this.editDrawer.data];
                return;
            }
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除当前这条记录吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const { SON_TABLE_FIELD } = this.status;
                    const tableId = `${this.tableHelper.getTableCode(SON_TABLE_FIELD)}`;
                    const dataArray = [
                        {
                            childId: data.childId,
                            keyId: this.person.keyId,
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobDataId: this.jobStepInfo.jobDataId,
                            changeType: WfDataChangeTypeEnum.DELETE,
                            tableId: tableId,
                        },
                    ];
                    this.workflowService.deleteTableData(dataArray).subscribe(() => {
                        this.editDrawer.data.splice(index, 1);
                        this.editDrawer.data = [...this.editDrawer.data];
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        /**
         * 计算
         */
        calculation: async () => {
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [this.person.keyId],
            };
            const list = await this.workflowService.dataVerification(params).toPromise();
            if (!list || list.length > 0) {
                this.dataVerificationIfy.list = list;
                this.dataVerificationIfy.open();
                return;
            }
            this.editDrawer.loading = true;
            const par = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                handlerIds: ['W01'],
                keyIds: [this.person.keyId],
            };
            this.workflowService.salaryCivilCalculation(par).subscribe(result => {
                this.editDrawer.loading = false;
                this.calculateChange.emit();
                this.editDrawer.totalData = null;
                this.getWfData();
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
        const tableId = `${this.tableHelper.getTableCode(SON_TABLE_FIELD)}`;
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            childFields: {
                [tableId]: [],
            },
            keyIds: [this.person.keyId],
        };
        if (this.editDrawer.isShowGZ21ATable) {
            // 显示GZ21A单独表格时增加子集参数
            data.childFields[this.tableHelper.getTableCode('GZ21A')] = [];
        }
        const dateTime = this.editDrawer.headerList.filter(v => v.TABLE_COLUMN_TYPE === 4);
        const { wfId } = this.jobStepInfo;
        this.workflowService.getPsnList(wfId, data).subscribe(result => {
            this.editDrawer.loading = false;
            if (result[tableId]) {
                // 全部数据
                this.editDrawer.data = result[tableId].map(v => {
                    v.childId = v[`${tableId}_ID`];
                    dateTime.forEach(item => {
                        if (item.TABLE_COLUMN_TYPE === 4 && v[item.TABLE_COLUMN_CODE]) {
                            v[item.TABLE_COLUMN_CODE] = moment(
                                v[item.TABLE_COLUMN_CODE],
                                'YYYYMMDD'
                            ).format('YYYY-MM-DD');
                        }
                    });
                    return v;
                });
                if (SON_TABLE_FIELD === 'GZ21A') {
                    this.editDrawer.data = this.editDrawer.data.filter(
                        v => v.GZ21A03 === TABLE_COLUMN_CODE.substr(6)
                    );
                }
            } else {
                this.editDrawer.data = [];
            }

            // 只在GZDA07C61和GZDA07B01两个字段时显示的GZ21A单独表格
            if (
                this.editDrawer.isShowGZ21ATable &&
                result[this.tableHelper.getTableCode('GZ21A')]
            ) {
                // GZ21A表格只显示津补贴字段与GZ21A03对应的数据
                this.gz21ATable.data = result[`${this.tableHelper.getTableCode('GZ21A')}`].filter(
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
