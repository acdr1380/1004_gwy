import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LedgerCheckService } from './ledger-check.service';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { LedgerManageService } from '../ledger-manage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    selector: 'app-ledger-check',
    templateUrl: './ledger-check.component.html',
    styleUrls: ['./ledger-check.component.scss']
})
export class LedgerCheckComponent implements OnInit, AfterViewInit {

    @Input() selectOrgDrawer: any;
    @Input() ledgerParams: {
        YEAR: number,
        LEDGER_TYPE: string,
        QUERY_ORG_LIST: []
    };
    // 当前机构
    @Input() currentOrg: {
        isInclude: boolean;
        groupValue: string;
        activedNode: {
            key: string, title: string, unitId: string,
            nodeType: OrgTypeEnum;
        };
    };
    @Input() ledgerTabs: [{ value: string, text: string, tblCols: [], active: boolean }];
    @ViewChild('tblWrap', { static: false }) _tblWrap: ElementRef;
    // 字段类型
    columnTypeEnum = ColumnTypeEnum;
    // 账本value，text键值对
    tabsHashMap = {};
    // 校验表格
    checkListTableOp = {
        pageSize: 30,
        pageIndex: 1,
        totalCount: 0,
        psnCount: 0,
        checkList: [],
        checkResult: [], // 查询结果集
        pageData: [], // 当前页数据
        pageSizeOptions: [5, 10, 20, 30, 40, 50],
        BufferPx: 500,
        ledgerList: [],
        editPersonId: '',
        scroll: {
            y: '500px',
        },
        isLoading: false,
        loadData: () => {
            // this.checkListTableOp.isLoading = true;
            const params = { ...this.ledgerParams };
            this.service.getCheckListData(params).subscribe(result => {
                // 获取影响账本名称
                result.forEach(rowData => {
                    Object.assign(rowData, {
                        ledgerName: rowData.tableCode.split(',').map(v => this.tabsHashMap[v] + '账本').join(',')
                    })
                });
                // 只操作第一页数据
                const pageData = result.slice(0, this.checkListTableOp.pageSize + 1);
                if (pageData.length > 0) {
                    // this.rowSpanPageData(pageData);
                    this.checkListTableOp.checkResult = result;
                    this.checkListTableOp.pageData = pageData;
                }
                this.checkListTableOp.psnCount = new Set(result.map(v => v.personId)).size;
                // this.checkListTableOp.isLoading = false;
            });
        },
        pageSizeChange: () => {
            const { checkResult, pageSize, pageIndex } = this.checkListTableOp;
            const pageStartIndex = (pageIndex - 1) * pageSize;
            const pageData = checkResult.slice(pageStartIndex, pageStartIndex + pageSize);
            // this.rowSpanPageData(pageData);
            this.checkListTableOp.pageData = pageData;
        },
        viewDetails: (rowData) => {
            const { tableCode, personId } = rowData;
            const { tables } = this.ledgerDetailsOp;
            this.checkListTableOp.editPersonId = personId;
            this.checkListTableOp.ledgerList = this.ledgerTabs.filter(tab => {
                const { value } = tab;
                if (tableCode.indexOf(value) === -1) {
                    return false;
                } else {
                    // 表格不存在时初始化
                    if (!tables[value]) {
                        const ledgerTable = {
                            isloading: true,
                            result: [],
                            scroll: { x: '2000px' },
                            tblCols: tab.tblCols
                        };
                        tables[value] = ledgerTable;
                    }
                    this.ledgerDetailsOp.tables[value].isLoading = true;
                    this.ledgerDetailsOp.loadData({ tableCode: value, personId });
                    return true;
                }
            });
        }
    };
    // 账本详情表格
    ledgerDetailsOp = {
        isIndeterminate: false,
        pageSizeOptions: [5, 10, 20, 30, 40, 50],
        isLoading: false,
        tables: {}, // {key：data:[],scroll:{ x: '2000px' },cols:[]},
        TABLE_NAME: '',
        editRowData: {},
        init: () => {
        },
        loadData: ({ tableCode, personId }: { tableCode: string, personId: string }) => {
            const params = {
                ...this.ledgerParams,
                TABLE_NAME: tableCode,
                [`${this.wfTableCode.getTableCode('A01')}_ID`]: personId

            }
            this.parentService.getLedgerTblData(params).subscribe(json => {
                if (!json) {
                    return;
                }
                Object.assign(this.ledgerDetailsOp.tables[tableCode], json, {
                    isLoading: false
                });
            })
        },
        pageSizeChange: () => {
        },
        addLedger: (event: Event, TABLE_NAME: string) => {
            this.ledgerDetailsOp.TABLE_NAME = TABLE_NAME;
            this.ledgerDetailsOp.editRowData = {}; // 清空rowData
            event.stopPropagation();
            this.addRecordDrawer.open({
                title: '添加记录',
                mode: 'add'
            });
        },
        deleteLedgerData: (TABLE_NAME: string, rowData: {}) => {
            this.ledgerDetailsOp.TABLE_NAME = TABLE_NAME;
            this.modalService.confirm({
                nzTitle: `是否确定删除?`,
                nzContent: '',
                nzOnOk: () => {
                    const data = {
                        TABLE_NAME: TABLE_NAME,
                        [TABLE_NAME + '_ID']: [rowData[TABLE_NAME + '_ID']],
                        LEDGER_TYPE: this.ledgerParams.LEDGER_TYPE,
                    };
                    this.parentService.deleteTblData(data).subscribe(() => {
                        this.ledgerDetailsOp.loadData({ tableCode: TABLE_NAME, personId: this.checkListTableOp.editPersonId })// 刷新表格
                    });
                },
            });
        },
        editLedger: (TABLE_NAME: string, rowData: {}) => {
            this.ledgerDetailsOp.TABLE_NAME = TABLE_NAME;
            this.ledgerDetailsOp.editRowData = rowData;
            this.addRecordDrawer.open({
                title: '修改记录',
                mode: 'update'
            });
        }
    };
    // 添加记录抽屉
    addRecordDrawer = {
        title: '添加记录',
        width: 400,
        visible: false,
        mode: 'add', // add or update
        lastTableName: '',
        fields: [],
        formGroup: new FormGroup({}),
        open: (customOption = {}) => {
            Object.assign(this.addRecordDrawer, customOption);
            const { mode, lastTableName, loadFormData } = this.addRecordDrawer;
            if (lastTableName !== this.ledgerDetailsOp.TABLE_NAME) {
                this.buildPageInfo('ledger_add_record', (fields, formGroup) => {
                    this.addRecordDrawer.fields = fields;
                    this.addRecordDrawer.formGroup = formGroup;
                    loadFormData();
                })
            } else {
                loadFormData();
            }
            this.addRecordDrawer.visible = true;
        },
        close: () => {
            this.addRecordDrawer.visible = false;
            this.addRecordDrawer.lastTableName = this.ledgerDetailsOp.TABLE_NAME; // 记录上一次账本，如果没改变则不重新加载表单
        },
        loadFormData: () => {
            const { mode, formGroup } = this.addRecordDrawer;
            if (mode === 'add') {
                formGroup.reset();
            } else {
                formGroup.patchValue({
                    ...this.ledgerDetailsOp.editRowData
                });
            }
        },
        save: () => {
            const { formGroup, mode } = this.addRecordDrawer;
            const { TABLE_NAME, editRowData } = this.ledgerDetailsOp;
            const { editPersonId } = this.checkListTableOp; // 特殊处理工资子集
            const idName = (mode === 'add' || TABLE_NAME === this.wfTableCode.getTableCode('A33') ? this.wfTableCode.getTableCode('A01') : TABLE_NAME) + '_ID';
            const id = mode === 'add' ? editPersonId : editRowData[idName];
            if (!this.common.formVerify(formGroup)) {
                return;
            }
            const formData = formGroup.getRawValue();
            // 过滤空值
            const submitFormData = Object.fromEntries(Object.entries(formData).filter(v => v[1]));
            const data = {
                LEDGER_TYPE: this.ledgerParams.LEDGER_TYPE,
                TABLE_NAME: TABLE_NAME,
                [idName]: [id],
                ISNEW: mode === 'add',
                ...submitFormData,
                YEAR: this.ledgerParams.YEAR
            };
            const method = mode === 'add' ? 'addLedgerData' : 'batchEditTblData';
            this.parentService[method](data).subscribe(result => {
                if (result) {
                    this.ledgerDetailsOp.loadData({ tableCode: TABLE_NAME, personId: editPersonId })// 刷新表格
                }
                this.addRecordDrawer.close();
            });
        },
    };

    constructor(
        private service: LedgerCheckService,
        private modalService: NzModalService,
        private message: NzMessageService,
        private parentService: LedgerManageService,
        private common: CommonService,
        private wfTableCode: WfTableHelper,
    ) { }

    ngOnInit() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(500))
            .subscribe(() => {
                this.ngAfterViewInit();
            });
        this.ledgerTabs.forEach(tab => {
            this.tabsHashMap[tab.value] = tab.text + '账本';
        });
    }

    ngAfterViewInit() {
        const el = this._tblWrap.nativeElement;
        this.checkListTableOp.BufferPx = el.clientHeight - 38 - 60; //  - 表头高度 - 分页
        this.checkListTableOp.scroll.y = `${this.checkListTableOp.BufferPx}px`;
        this.checkListTableOp.scroll = { ...this.checkListTableOp.scroll };
    }

    /**
     * 校验数据
     */
    checkData() {
        this.checkListTableOp.loadData();
    }

    /**
     * 处理表格行合并
     */
    rowSpanPageData(pageData) {
        let rowSpan = 1;
        let rowIndex = 0;
        let lastKeyId = pageData[0].personId;
        pageData.forEach((row, index) => {
            if (rowIndex !== index && lastKeyId === row.personId) {
                pageData[index].isHide = true;
                rowSpan++;
                if (
                    rowIndex !== index &&
                    lastKeyId === row.personId &&
                    index === pageData.length - 1
                ) {
                    pageData[rowIndex].rowSpan = rowSpan;
                    rowSpan = 1;
                    rowIndex = index;
                    lastKeyId = row.personId;
                }
            } else {
                pageData[index].isHide = false;
                pageData[rowIndex].rowSpan = rowSpan;
                rowSpan = 1;
                rowIndex = index;
                lastKeyId = row.personId;
            }
        });
    }

    /**
     * 构建表单
     */
    buildPageInfo(planName: string, okFn: (fields: any[], formGroup: FormGroup) => void) {
        this.common.getSchemeContent(planName).subscribe(result => {
            if (result) {
                const tabValue = this.ledgerDetailsOp.TABLE_NAME;
                const { systemSchemeEdit } = result['systemSchemeList'].find(v => {
                    return v.systemSchemeTable.TABLE_CODE === tabValue;
                }) || { systemSchemeEdit: null };
                if (systemSchemeEdit === null) {
                    return this.message.error('未找到表单对应的界面方案！');
                }
                const formGroup = new FormGroup({});
                systemSchemeEdit.forEach(field => {
                    formGroup.addControl(
                        field.TABLE_COLUMN_CODE,
                        new FormControl(null, {
                            validators: field.SCHEME_EDIT_IS_MUST_INPUT
                                ? Validators.required
                                : null,
                        })
                    );
                });
                okFn(systemSchemeEdit, formGroup)
            }
        });
    }
}
