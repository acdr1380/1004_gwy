import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkflowService } from 'app/workflow/workflow.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
@Component({
    selector: 'tibet-edit-adjust-child-order',
    templateUrl: './adjust-child-order.component.html',
    styleUrls: ['./adjust-child-order.component.scss'],
})
export class AdjustChildOrderComponent implements OnInit {
    constructor(private message: NzMessageService, private workflowService: WorkflowService) { }
    /**
     * 子集
     */
    @Input() tableCode;
    /**
     * 表格数据
     */
    _tableData;
    @Input() set tableData(v) {
        this._tableData = v;
        this.adjustChild.tableData = v;
    }
    get tableData() {
        return this._tableData;
    }
    _tableHeaderList;
    @Input() set tableHeaderList(v) {
        this.adjustChild.tableHeaderList = v;
        this._tableHeaderList = v;
    }
    get tableHeaderList() {
        return this._tableHeaderList;
    }

    @Input() jobStepInfo: JobStepInfo;
    @Output()
    childDataChange = new EventEmitter<any>();
    /**
     * 调整子集顺序
     */
    adjustChild = {
        visible: false,
        tableData: [],
        tableHeaderList: [],
        open: () => {
            console.log(this.tableData, this.tableHeaderList);

            this.adjustChild.visible = true;
        },
        close: () => {
            this.adjustChild.visible = false;
            // 将改变的值传递出去
            this.childDataChange.emit(this.adjustChild.tableData);
        },
        // 调整子集顺序
        moveOrder: (sign, item) => {
            console.log(item, this.adjustChild.tableHeaderList);
            const tableId = this.tableCode;
            const index = this.adjustChild.tableData.findIndex(
                v => v[tableId + '_ID'] === item[tableId + '_ID']
            );
            if (sign === 'up' && Number(index + 1) === Number(1)) {
                this.message.warning('已经是第一位无法上移!');
                return;
            }
            if (
                sign === 'down' &&
                Number(index) === Number(this.adjustChild.tableData.length - 1)
            ) {
                this.message.warning('已经是最后一位无法下移!');
                return;
            }
            const paramsArr = [];
            const SYS_SORT = [
                {
                    childId:
                        sign === 'up'
                            ? this.adjustChild.tableData[index - 1][tableId + '_ID']
                            : this.adjustChild.tableData[index + 1][tableId + '_ID'],
                    SYS_SORT: item.SYS_SORT,
                },
                {
                    childId: item[tableId + '_ID'],
                    SYS_SORT:
                        sign === 'up'
                            ? this.adjustChild.tableData[index - 1].SYS_SORT
                            : this.adjustChild.tableData[index + 1].SYS_SORT,
                },
            ];
            SYS_SORT.forEach(v => {
                const resultData = {
                    keyId: item[tableId + '_A01_ID'],
                    childId: v.childId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: tableId,
                    data: { SYS_SORT: v.SYS_SORT },
                };
                paramsArr.push(resultData);
            });
            this.workflowService.saveMultipleTableData(paramsArr).subscribe(result => {
                if (result) {
                    this.message.success('移动成功!');
                    SYS_SORT.forEach(v => {
                        const indexs = this.adjustChild.tableData.findIndex(
                            // tslint:disable-next-line: no-shadowed-variable
                            t => t[tableId + '_ID'] === v.childId
                        );
                        this.adjustChild.tableData[indexs].SYS_SORT = v.SYS_SORT;
                    });
                    this.adjustChild.tableData.sort((a, b) => {
                        return a.SYS_SORT - b.SYS_SORT;
                    });
                    this.adjustChild.tableData = [...this.adjustChild.tableData];
                }
            });
        },
    };

    ngOnInit(): void { }
    show() {
        this.adjustChild.open();
    }
}
