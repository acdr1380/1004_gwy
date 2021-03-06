import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { Component, Input, OnInit } from '@angular/core';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { SalaryFields as gwy } from './gwy/fields';
import { SalaryFields as sy } from './sy/fields';
import { personBaseInfo, personSalaryInfo } from './gwy/tabs';
import * as moment from 'moment';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oper-salary-info',
    templateUrl: './oper-salary-info.component.html',
    styleUrls: ['./oper-salary-info.component.scss'],
})
export class OperSalaryInfoComponent implements OnInit {
    SalaryFields;

    _params: any;
    @Input() set params(v) {
        if (!v || Object.keys(v).length === 0) {
            return;
        }

        this.SalaryFields = v.type === 'sy' ? sy : gwy;
        this.personBaseInfoIfy.tabs.setList = personBaseInfo;
        this.personsalaryInfoIfy.tabs.setList = personSalaryInfo;

        this.personBaseInfoIfy.tabs._init();
        this.personsalaryInfoIfy.tabs._init();

        this._params = v;
        this.loadPersonData();
    }
    get params() {
        return this._params;
    }

    columnTypeEnum = ColumnTypeEnum;
    personInfo;

    /**
     * 人员基本信息
     */
    personBaseInfoIfy = {
        TABLE_DISPLAY_CODE: 'A01',
        tabs: {
            setList: [],
            _init: () => {
                this.personBaseInfoIfy.tabs.setList.forEach(item => {
                    item.fields = this.SalaryFields[item.TABLE_DISPLAY_CODE];
                    item.result = [];
                });
            },
        },
    };

    /**
     * 人员工资信息
     */
    personsalaryInfoIfy = {
        TABLE_DISPLAY_CODE: 'GZDA07',
        tabs: {
            setList: [],
            _init: () => {
                this.personsalaryInfoIfy.tabs.setList.forEach(item => {
                    item.fields = this.SalaryFields[item.TABLE_DISPLAY_CODE];
                    item.result = [];
                });
            },
        },
    };

    constructor(private workflowService: WorkflowService, private tableHelper: WfTableHelper) {}

    ngOnInit() {}

    /**
     * 加载表格数据
     */
    private async loadPersonData() {
        const childFields = {};
        const tableList = this.personBaseInfoIfy.tabs.setList.concat(
            this.personsalaryInfoIfy.tabs.setList
        );
        tableList.forEach(
            v => (childFields[`${this.tableHelper.getTableCode(v.TABLE_CODE)}`] = [])
        );
        this.personInfo = await this.workflowService
            .getPsnList(this.params.wfId, {
                ...this.params,
                keyIds: [this.params.keyId],
                createChangeHistoryData: true,
                childFields,
            })
            .toPromise();

        this.buildPersonData();
    }

    /**
     * 构建显示数据
     */
    buildPersonData() {
        const tableList = this.personBaseInfoIfy.tabs.setList.concat(
            this.personsalaryInfoIfy.tabs.setList
        );

        tableList.forEach(item => {
            const data = this.personInfo[`${this.tableHelper.getTableCode(item.TABLE_CODE)}`];
            if (item && data) {
                // 主集取数
                if (item.showMain && item.isMain) {
                    item.result = data[0];
                }

                // 子集取最后一条显示
                if (item.showMain && !item.isMain) {
                    item.result = data.find(v => v.IS_LAST_ROW) || [];
                }

                // 子集所有记录
                if (!item.showMain) {
                    item.result = data;
                }
            }
        });
    }
}
