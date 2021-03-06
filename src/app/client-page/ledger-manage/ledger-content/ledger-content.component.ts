import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectorRef,
    AfterViewInit,
    Output,
} from '@angular/core';
import { LedgerManageService } from '../ledger-manage.service';
import { Observable, fromEvent } from 'rxjs';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import * as _ from 'lodash';
import LegerConfig from '../assets/ledger-config/ledger-config';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { debounceTime } from 'rxjs/operators';
import { LedgerCheckComponent } from '../ledger-check/ledger-check.component';
import { EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Base64 } from 'js-base64';
import {
    NzFormatEmitEvent,
    NzTreeComponent,
    NzTreeNode,
    NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

declare global {
    interface Object {
        fromEntries: Function;
    }
}

@Component({
    selector: 'app-ledger-content',
    templateUrl: './ledger-content.component.html',
    styleUrls: ['./ledger-content.component.scss'],
})
export class LedgerContentComponent implements OnInit, OnChanges, AfterViewInit {
    // 年份列表
    @Input() currentYear = '2020';
    // @Output() currentYearChange = new EventEmitter();

    // 账本类别列表
    @Input() ledgerType: String = LegerConfig[0].value;

    // 当前机构
    @Input() currentOrg: {
        isInclude: boolean;
        groupValue: string;
        activedNode: {
            key: string;
            title: string;
            unitId: string;
            nodeType: OrgTypeEnum;
        };
    };
    // 当前单位：默认为账号所在单位，选择机构后切换
    get selectedNode() {
        const { activedNode } = this.selectPersonIfy.unitify;
        if (activedNode) {
            const {
                title,
                key,
                origin: { nodeType, unitId },
            } = activedNode;
            return {
                key,
                title,
                nodeType,
                unitId,
            };
        } else {
            const { unitName: title, nodeType = OrgTypeEnum.UNIT, unitId } = this.sessionUser;
            return {
                key: '',
                title,
                nodeType,
                unitId,
            };
        }
    }
    // 机构选择抽屉
    @Input() selectOrgDrawer: any;

    URLParams: any;
    // 字段类型
    columnTypeEnum = ColumnTypeEnum;
    // 是否包含下层
    incSub = false;
    searchList$ = new Observable<any>();
    // 机构查询下拉列表
    searchSelect = {
        placeholder: '请输入关键字搜索',
        value: null,
        nzFilterOption: () => true,
        listOfOption: [],
        Parents: [],
        orgid: null,
    };
    @ViewChild('OrgTree', { static: false }) _orgTree: NzTreeComponent;
    @ViewChild('tblWrap', { static: false }) _tblWrap: ElementRef;
    @ViewChild('ledgerTable', { static: false }) _ledgerTable: NzTableComponent;
    @ViewChild('ledgerTblHead', { static: false }) _ledgerTblHead: ElementRef;
    @ViewChild('psnListTbl', { static: false }) _psnListTbl: ElementRef;
    @ViewChild('scrollViewport', { static: false })
    private _scrollViewport: CdkVirtualScrollViewport;
    @ViewChild('unitTreeElement', { static: false }) private _unitTreeElement: NzTreeComponent;
    @ViewChild('scrollViewportDrawer', { static: false })
    private _scrollViewportDrawer: CdkVirtualScrollViewport;
    @ViewChild('unitSelectorifyTree', { static: false }) _unitSelectorifyTree: NzTreeComponent;
    @ViewChild('appLedgerCheck', { static: false }) _appLedgerCheck: LedgerCheckComponent;
    // 账本选项卡
    ledgerTab = {
        nzShowPagination: true,
        nzType: 'card',
        selectedIndex: 0,
        TABLE_NAME: '',
        childTabItemID: '',
        A0101ItemID: 'A0101', // 账本人员姓名筛选字段名
        data: [],
        onSelectChange: ({ index, loadTbl = true }) => {
            const { value, childTabItemID, A0101ItemID = 'A0101' } = this.ledgerTab.data[index];
            Object.assign(this.ledgerTab, {
                TABLE_NAME: value,
                childTabItemID,
                A0101ItemID: A0101ItemID,
            });
            this.ledgerTbl.reload = true;
            if (loadTbl) {
                this.ledgerChildTab.loadTabData();
            }
        },
        init: (loadTbl: boolean = true) => {
            const { tabs } = LegerConfig.find(v => v.value === this.ledgerType);
            this.ledgerTab.data = tabs;
            this.ledgerTab.onSelectChange({
                index: this.ledgerTab.selectedIndex,
                loadTbl: loadTbl,
            });
        },
    };
    // 子账本选项卡
    ledgerChildTab = {
        nzShowPagination: true,
        nzType: 'line',
        selectedIndex: 0,
        value: '',
        data: [],
        init: () => {
            this.ledgerChildTab.selectChange({ index: this.ledgerChildTab.selectedIndex });
        },
        loadTabData: () => {
            // this.ledgerTbl.isLoading = true;
            const { TABLE_NAME, childTabItemID } = this.ledgerTab;
            const { activedNode } = this.currentOrg;
            const data = {
                LEDGER_TYPE: this.ledgerType,
                TABLE_NAME: TABLE_NAME,
                ITEM_ID: childTabItemID,
                YEAR: this.currentYear,
                QUERY_ORG_LIST: [
                    {
                        DATA_UNIT_ORG_ID: activedNode.key || '',
                        ORG_B01_ID: activedNode.unitId,
                        ORG_TYPE: activedNode.nodeType,
                        $TREE_INCLUDE_LOWER_LEVEL$: this.currentOrg.isInclude,
                    },
                ],
            };
            this.service.getLedgerChildTab(data).subscribe(result => {
                this.ledgerChildTab.data = result;
                this.ledgerChildTab.init();
            });
        },
        selectChange: ({ index }) => {
            const { data } = this.ledgerChildTab;
            if (data.length > 0) {
                this.ledgerChildTab.value = data[index].VALUE;
            }
            this.ledgerTbl.init();
        },
    };

    // 代码项缓存
    codeListCache = {};
    // 账本表格内容
    ledgerTbl = {
        pageSize: 30,
        pageIndex: 1,
        totalCount: 0,
        isCheckAll: false,
        checkList: [],
        isIndeterminate: false,
        listOfAllData: [],
        isEdit: false,
        reload: false, // 是否重新构造列配置
        tblCols: [],
        pageSizeOptions: [5, 10, 20, 30, 40, 50],
        BufferPx: 500,
        scroll: {
            x: '2000px',
            y: '500px',
        },
        bodyHeight: 0,
        searchValue: '',
        isLoading: false,
        sort: {
            key: '',
            value: '',
        },
        filterList: [],
        filterFields: <any>{
            list: [],
            result: {},
            // 表格头部筛选条件
            evtChange: (data, field) => {
                const filterResult = this.ledgerTbl.filterFields.result;
                if (data.length === 0) {
                    delete filterResult[field];
                } else {
                    filterResult[field] = data;
                }
                this.ledgerTbl.loadData();
            },
        },
        changedData: [],
        init: () => {
            const tbl = this.ledgerTbl;
            if (this.ledgerTbl.reload) {
                // 表格配置初始化
                const tab = this.ledgerTab.data[this.ledgerTab.selectedIndex];
                const tblCols = [...tab.tblCols];
                // 去除第一列，序号列
                tblCols.shift();
                tbl.scroll.x =
                    tblCols.reduce(
                        (pre, cur) => {
                            cur.left = cur.isFixed ? pre.width : false; // 设置固定列的nzleft值
                            return {
                                width: pre.width + cur.width,
                            };
                        },
                        { width: 60 }
                    ).width +
                    240 +
                    'px';
                tbl.tblCols = tblCols;
                // 配置过滤项
                tbl.filterFields.list = tblCols
                    .filter(v => v.isFilter)
                    .map(v => {
                        tbl.filterFields[v.field] = [];
                        return {
                            field: v.field,
                            codeId: v.CodeID,
                        };
                    });
                // tbl.filterFields.list.forEach(async item => {
                //     tbl.filterFields[item.field] = await tbl.getCodeList(item.codeId);
                // });
                this.service
                    .selectListByCodes(tbl.filterFields.list.map(item => item.codeId))
                    .subscribe(result => {
                        tbl.filterFields.list.forEach(item => {
                            tbl.filterFields[item.field] = result[item.codeId];
                        });
                    });

                this.ledgerTbl.reload = false;
            }
            tbl.pageIndex = 1;
            tbl.checkList = []; // 清空已选项
            // 加载数据
            this.ledgerTbl.loadData();
        },
        loadData: () => {
            // this.ledgerTbl.isLoading = true;
            const params = this.getLedgerParams();
            const { sort, pageIndex } = this.ledgerTbl;
            if (sort.key) {
                params['SORT'] = {
                    FIELD: sort.key,
                    MODE: sort.value.replace('end', ''),
                };
            }
            this.service.getLedgerTblData(params).subscribe(json => {
                // this.ledgerTbl.isLoading = false;
                if (!json) {
                    return;
                }
                const idField = this.ledgerTab.TABLE_NAME + '_ID';
                let checkedSum = 0;
                this.ledgerTbl.checkList.forEach(item => {
                    const index = json.result.findIndex(v => v[idField] === item[idField]);
                    if (index > -1) {
                        json.result[index].checked = true;
                        checkedSum++;
                    }
                });
                this.ledgerTbl.isCheckAll =
                    checkedSum > 0 && checkedSum === this.ledgerTbl.checkList.length;
                Object.assign(this.ledgerTbl, {
                    listOfAllData: json.result,
                    totalCount: pageIndex === 1 ? json.totalCount : this.ledgerTbl.totalCount,
                    pageIndex: json.pageIndex,
                });
            });
        },
        getCodeList: async (codeId: string) => {
            const codeListCache = this.codeListCache;
            if (!codeListCache[codeId]) {
                codeListCache[codeId] = await this.service.getCodeList(codeId).toPromise();
                codeListCache[codeId].unshift({
                    text: '空值',
                    value: null,
                });
            }
            return codeListCache[codeId];
        },
        pageSizeChange: () => {
            this.ledgerTbl.loadData();
        },
        sortChange: (sort: any) => {
            Object.assign(this.ledgerTbl.sort, sort);
            this.ledgerTbl.loadData();
        },
        checkAll: value => {
            this.ledgerTbl.listOfAllData.forEach(row => (row.checked = value));
            this.ledgerTbl._getCheckList();
        },
        checkRow: () => {
            this.ledgerTbl._getCheckList();
        },
        _getCheckList: () => {
            const idField = this.ledgerTab.TABLE_NAME + '_ID';
            const currentPageDataIds = this.ledgerTbl.listOfAllData.map(v => v[idField]);
            // 处理真分页,翻页跳转后记录历史页的选中项
            this.ledgerTbl.checkList = this.ledgerTbl.listOfAllData
                .filter(row => row.checked)
                .concat(
                    this.ledgerTbl.checkList.filter(
                        v => currentPageDataIds.indexOf(v[idField]) === -1
                    )
                );
        },
        deleteCheckData: () => {
            this.modalService.confirm({
                nzTitle: `已勾选${this.ledgerTbl.checkList.length}人,是否确定删除勾选项?`,
                nzContent: '',
                nzOnOk: () => {
                    let { TABLE_NAME } = this.ledgerTab;
                    const idArr = this.ledgerTbl.checkList.map(item => {
                        return item[TABLE_NAME + '_ID'];
                    });
                    if (idArr.length === 0) {
                        return this.createMessage('warning', '请勾选要删除的人员!');
                    }
                    // 特殊处理工资子集
                    TABLE_NAME =
                        TABLE_NAME === this.wfTableCode.getTableCode('A33')
                            ? this.wfTableCode.getTableCode('A01')
                            : TABLE_NAME;
                    const data = {
                        TABLE_NAME: TABLE_NAME,
                        [TABLE_NAME + '_ID']: idArr,
                        LEDGER_TYPE: this.ledgerType,
                    };
                    this.service.deleteTblData(data).subscribe(() => {
                        this.ledgerChildTab.loadTabData();
                    });
                },
            });
        },
    };

    // 选人抽屉
    // 人员表格
    @ViewChild('personTableTemp', { static: false })
    personTableTemp: NzTableComponent;
    selectedPsnList: any[] = [];
    displayData: any[] = [];
    selectPersonIfy = {
        title: '选择人员',
        width: 560,
        visible: false,
        close: () => {
            this.selectedPsnList.length = 0; // 关闭抽屉时清空选人
            this.selectPersonIfy.find.searchKey = null;
            this.selectPersonIfy.visible = false;
        },
        open: () => {
            this.selectPersonIfy.visible = true;
            this.selectPersonIfy.tableIfy.loadPersonTable();
        },

        list: [],
        selected_keyId: null,
        evtSelected: () => {
            const data = {
                LEDGER_TYPE: this.ledgerType,
                TABLE_NAME: this.ledgerTab.TABLE_NAME,
                [`${this.wfTableCode.getTableCode('A01')}_ID`]: this.selectedPsnList.map(
                    v => v[`${this.wfTableCode.getTableCode('A01')}_ID`]
                ),
            };
            this.addLedgerData(data, () => {
                this.selectPersonIfy.close();
            });
        },
        evtSelectedPerson: item => {
            this.selectPersonIfy.selected_keyId = item.keyId;
        },

        find: {
            searchWidth: 280,
            placeholder: '输入人员姓名关键字查询',
            nzFilterOption: () => true,

            searchKey: null,
            list: [],
            evtOpenChange: status => {
                if (status) {
                    this.selectPersonIfy.find.searchKey = null;
                }
            },

            evtChange: event => {
                console.log(event);
                if (event === null) {
                    return;
                }
                const params = this.selectPersonIfy.getCondition({
                    [`${this.wfTableCode.getTableCode('A01')}_ID`]: event,
                });
                const tbl = this.selectPersonIfy.tableIfy;
                this.service.queryPersonRowNumber(params).subscribe(num => {
                    // tslint:disable-next-line:radix
                    tbl.pageIndex =
                        // tslint:disable-next-line:radix
                        parseInt((num / tbl.pageSize).toString()) + 1;
                    tbl.selectedRowIndex = num % tbl.pageSize;
                    tbl.loadPersonTable(false, true);
                });
            },
            evtSearch: event => {
                if (event) {
                    const params = this.selectPersonIfy.getCondition({
                        $TREE_INCLUDE_LOWER_LEVEL$: false,
                        A0101: event.trim(),
                    });
                    this.service.queryPersonList(params).subscribe(result => {
                        this.selectPersonIfy.find.list = result;
                    });
                }
            },
            evtFocus: () => {},
        },
        getCondition: (customCondition = {}) => {
            const tbl = this.selectPersonIfy.tableIfy;
            const { pageIndex, pageSize } = tbl;
            const { selectedNode } = this;
            return {
                $PAGE_INDEX$: pageIndex,
                $PAGE_SIZE$: pageSize,
                UNIT_TYPE: '02', // 按统计单位取数
                DATA_UNIT_ORG_ID: selectedNode.key,
                ORG_B01_ID: selectedNode.unitId,
                ORG_TYPE: selectedNode.nodeType,
                $TREE_INCLUDE_LOWER_LEVEL$: this.currentOrg.isInclude,
                PCLASSID: '01',
                A0165: '-1',
                ...customCondition,
            };
        },
        evtSwitchUnit: () => {
            if (this.selectPersonIfy.unitify.nodes.length === 0) {
                this.service.getOrgUnitTree(this.currentOrg.groupValue).subscribe(result => {
                    this.selectPersonIfy.unitify.nodes = result;
                });
            }
            this.selectPersonIfy.unitify.open();
        },
        evtSelectedClose: item => {
            this.selectPersonIfy.tableIfy.refreshStatus(false, item);
        },
        evtSelectorPerson: () => {
            this.selectPersonIfy.open();
        },
        evtRemovePerson: item => {
            this.selectPersonIfy.evtSelectedClose(item);
            this.selectPersonIfy.list = this.selectedPsnList;
        },
        tableIfy: {
            data: [],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            selectRowIndex: -1,
            selectedRowIndex: 0,
            allChecked: false,
            isloading: false,
            indeterminate: false,
            loadPersonTable: (reset: boolean = false, isSelectedRow: boolean = false) => {
                const tbl = this.selectPersonIfy.tableIfy;
                // tbl.isloading = true;
                if (reset) {
                    tbl.pageIndex = 1;
                }
                if (!isSelectedRow) {
                    tbl.selectedRowIndex = -1;
                }
                const { pageIndex, pageSize } = tbl;
                const params = this.selectPersonIfy.getCondition();
                this.service.getPersonDataPage(params).subscribe(json => {
                    if (json) {
                        this.selectedPsnList.forEach(item => {
                            const index = json.result.findIndex(
                                v =>
                                    v[`${this.wfTableCode.getTableCode('A01')}_ID`] ===
                                    item[`${this.wfTableCode.getTableCode('A01')}_ID`]
                            );
                            if (index > -1) {
                                json.result[index].checked = true;
                            }
                        });
                        Object.assign(
                            tbl,
                            {},
                            {
                                data: json.result,
                                totalCount: pageIndex === 1 ? json.totalCount : tbl.totalCount,
                                pageIndex: pageIndex,
                            }
                        );
                    }
                    // 是否选中行
                    // if (isSelectedRow) {
                    //     this.personTableTemp.cdkVirtualScrollViewport.scrollToIndex(
                    //         this.selectPersonIfy.tableIfy.selectedRowIndex
                    //     );
                    // } else {
                    //     this.personTableTemp.cdkVirtualScrollViewport.scrollToIndex(0);
                    // }
                    // tbl.isloading = false;
                });
            },
            currentPageDataChange: ($event: Array<any>) => {
                this.displayData = $event;
                this.selectPersonIfy.tableIfy.refreshStatus();
            },
            refreshStatus: (status?: boolean, data?) => {
                if (data) {
                    const index = this.selectedPsnList.findIndex(
                        v =>
                            v[`${this.wfTableCode.getTableCode('A01')}_ID`] ===
                            data[`${this.wfTableCode.getTableCode('A01')}_ID`]
                    );
                    if (status && index === -1) {
                        this.selectedPsnList.push(data);
                    }
                    if (!status && index > -1) {
                        this.selectedPsnList.splice(index, 1);
                        this.displayData.find(
                            v =>
                                v[`${this.wfTableCode.getTableCode('A01')}_ID`] ===
                                data[`${this.wfTableCode.getTableCode('A01')}_ID`]
                        ).checked = false;
                    }
                }
                const validData = this.displayData.filter(value => !value.disabled);
                const allChecked =
                    validData.length > 0 && validData.every(value => value.checked === true);
                const allUnChecked = validData.every(value => !value.checked);
                this.selectPersonIfy.tableIfy.allChecked = allChecked;
                this.selectPersonIfy.tableIfy.indeterminate = !allChecked && !allUnChecked;
            },
            checkAll: (value: boolean) => {
                this.displayData.forEach(psn => {
                    const psnI = this.selectedPsnList.findIndex(
                        v =>
                            v[`${this.wfTableCode.getTableCode('A01')}_ID`] ===
                            psn[`${this.wfTableCode.getTableCode('A01')}_ID`]
                    );
                    if (value && psnI === -1) {
                        // 全选，只有未选择人员才加入已选列表
                        this.selectedPsnList.push(psn);
                    } else if (!value && psnI > -1) {
                        this.selectedPsnList.splice(psnI, 1);
                    }
                    psn.checked = value;
                });
                this.selectedPsnList = [...this.selectedPsnList];
                this.selectPersonIfy.tableIfy.refreshStatus();
            },
        },

        unitify: {
            title: '选择单位',
            width: 470,
            visible: false,
            close: () => (this.selectPersonIfy.unitify.visible = false),
            open: () => (this.selectPersonIfy.unitify.visible = true),
            nodes: [] as NzTreeNodeOptions[],
            nzSelectedKeys: [],
            nzExpandedKeys: [],
            activedNode: <NzTreeNode>null,
            icons: ['sitemap', 'server', 'building-o'],
            expandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;
                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getOrgUnitTree({
                                ORG_GROUP_ID: this.currentOrg.groupValue,
                                SYS_PARENT: node.key,
                            })
                            .subscribe(result => node.addChildren(result));
                    }
                }
            },
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.selectPersonIfy.unitify.activedNode = data.node;
                this.selectPersonIfy.unitify.close();
                this.selectPersonIfy.tableIfy.loadPersonTable();
            },
            searchSelect: {
                width: 400,
                placeholder: '请输入关键字搜索',
                value: null,
                nzFilterOption: () => true,
                searchList: [],
                parentList: [],
                isSearching: false,
                moduleChange: value => {
                    this.service.getOrgParentAllList(value).subscribe(result => {
                        if (result) {
                            this.selectPersonIfy.unitify.searchSelect.parentList = result;
                            const nodes = this._unitTreeElement.getTreeNodes();
                            this.selectPersonIfy.unitify.searchSelect.location(nodes);
                        }
                    });
                },
                onSearch: (keyword: string) => {
                    if (keyword) {
                        this.selectPersonIfy.unitify.searchSelect.isSearching = true;
                        this.service
                            .selectListByQuery(this.currentOrg.groupValue, keyword.trim())
                            .subscribe(result => {
                                this.selectPersonIfy.unitify.searchSelect.searchList = result;
                                this.selectPersonIfy.unitify.searchSelect.isSearching = false;
                            });
                    }
                },
                location: nodes => {
                    nodes.forEach(async node => {
                        if (node.key === this.selectPersonIfy.unitify.searchSelect.value) {
                            this.selectPersonIfy.unitify.nzSelectedKeys = [node.key];
                            this.selectPersonIfy.unitify.activedNode = node;
                            this.selectorTreeNodeScrollPosition();
                        } else {
                            const _parent =
                                this.selectPersonIfy.unitify.searchSelect.parentList.find(
                                    v => node.key === v.DATA_UNIT_ORG_ID
                                );
                            if (_parent) {
                                if (node && node.getChildren().length === 0) {
                                    const childNodes = await this.asyncLoadNodeChildNode(node.key);
                                    node.addChildren(childNodes);
                                }
                                this.selectPersonIfy.unitify.nzExpandedKeys = [
                                    ...this.selectPersonIfy.unitify.nzExpandedKeys,
                                    node.key,
                                ];
                                this.selectPersonIfy.unitify.searchSelect.location(node.children);
                            }
                        }
                    });
                },
            },
        },
    };
    addRecordDrawer = {
        title: '添加记录',
        width: 400,
        visible: false,
        fields: [],
        formGroup: new FormGroup({}),
        open: () => {
            this.addRecordDrawer.buildPageInfo();
            this.addRecordDrawer.visible = true;
        },
        close: () => {
            this.addRecordDrawer.visible = false;
        },
        save: () => {
            const { formGroup } = this.addRecordDrawer;
            if (!this.common.formVerify(formGroup)) {
                return;
            }
            const formData = formGroup.getRawValue();
            // 过滤空值
            const submitFormData = Object.fromEntries(Object.entries(formData).filter(v => v[1]));
            console.log(submitFormData);
            const data = {
                LEDGER_TYPE: this.ledgerType,
                TABLE_NAME: this.ledgerTab.TABLE_NAME,
                [`${this.wfTableCode.getTableCode('A01')}_ID`]: this.selectedPsnList.map(
                    v => v[`${this.wfTableCode.getTableCode('A01')}_ID`]
                ),
                ISNEW: true,
                ...submitFormData,
            };
            this.addLedgerData(data, () => {
                this.addRecordDrawer.close();
            });
        },
        buildPageInfo: () => {
            this.buildPageInfo('ledger_add_record', (fields, formGroup) => {
                this.addRecordDrawer.fields = fields;
                this.addRecordDrawer.formGroup = formGroup;
            });
        },
    };
    // 批量修改抽屉
    batchEditDrawer = {
        title: '批量修改',
        width: 860,
        visible: false,
        personTableOp: {
            pageSize: 10,
            allChecked: true,
            result: [],
            evtCheckAll: value => {
                this.batchEditDrawer.personTableOp.result.forEach(row => (row.checked = value));
            },
        },
        fields: [],
        formGroup: new FormGroup({}),
        open: () => {
            if (this.ledgerTbl.checkList.length === 0) {
                return this.createMessage('warning', '请先勾选需要修改的人员');
            }
            this.batchEditDrawer.personTableOp.result = this.ledgerTbl.checkList;
            this.batchEditDrawer.buildPageInfo();
            this.batchEditDrawer.visible = true;
        },
        close: () => {
            this.batchEditDrawer.visible = false;
        },
        save: () => {
            const { TABLE_NAME } = this.ledgerTab;
            // 特殊处理工资子集
            const idName =
                (TABLE_NAME === this.wfTableCode.getTableCode('A33')
                    ? this.wfTableCode.getTableCode('A01')
                    : TABLE_NAME) + '_ID';
            const ids = this.ledgerTbl.checkList.map(item => {
                return item[idName];
            });
            const formData = this.batchEditDrawer.formGroup.getRawValue();
            // 过滤空值,只保存变动
            const submitFormData = Object.fromEntries(Object.entries(formData).filter(v => v[1]));
            const data = {
                LEDGER_TYPE: this.ledgerType,
                TABLE_NAME,
                [idName]: ids,
                ...submitFormData,
                YEAR: 2020,
            };
            this.service.batchEditTblData(data).subscribe(() => {
                this.ledgerChildTab.loadTabData();
                this.batchEditDrawer.close();
            });
        },
        buildPageInfo: () => {
            this.buildPageInfo('ledger_batch_edit', (fields, formGroup) => {
                this.batchEditDrawer.fields = fields;
                this.batchEditDrawer.formGroup = formGroup;
            });
        },
    };
    // 数据校验抽屉
    dataCheckDrawer = {
        title: '数据校验',
        width: 960,
        visible: false,
        selectedTags: [],
        searchTbl: {
            data: [],
            listOfData: [],
            pageIndex: 0,
            pageSize: 5,
        },
        open: () => {
            this.dataCheckDrawer.visible = true;
        },
        close: () => {
            this.dataCheckDrawer.visible = false;
        },
        loadVerify: () => {},
    };
    // 当前账号信息
    sessionUser = this.common.getUserLoginInfo();

    constructor(
        private service: LedgerManageService,
        private clientService: ClientService,
        private cdr: ChangeDetectorRef,
        private message: NzMessageService,
        private modalService: NzModalService,
        private common: CommonService,
        private activatedRoute: ActivatedRoute,
        private wfTableCode: WfTableHelper
    ) {}

    ngOnInit() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(500))
            .subscribe(() => {
                this.ngAfterViewInit();
            });
        this.ledgerTab.init();
    }
    ngAfterViewInit() {
        const el = this._tblWrap.nativeElement;
        const tabHeight = 50;
        this.ledgerTbl.BufferPx = el.clientHeight - 60 - 60 - tabHeight; //  - 表头高度 - 分页
        this.ledgerTbl.scroll.y = `${this.ledgerTbl.BufferPx}px`;
        this.ledgerTbl.scroll = { ...this.ledgerTbl.scroll };
        this.cdr.detectChanges();
        this.loadRouterParams();
    }
    ngOnChanges(changes: SimpleChanges) {
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName) && !changes[propName].firstChange) {
                switch (propName) {
                    case 'currentYear':
                        this.ledgerTbl.reload = true;
                        this.ledgerChildTab.loadTabData();
                        break;
                    case 'ledgerType':
                        this.ledgerTab.init();
                        break;
                    case 'currentOrg':
                        this.ledgerTbl.reload = true;
                        this.ledgerChildTab.loadTabData();
                        break;
                }
            }
        }
    }

    //#region 公用方法
    createMessage(type: string, msg: string) {
        this.message.create(type, msg);
    }
    //#endregion

    //#region 人员相关
    exportTbl() {}
    //#endregion

    //#region 机构相关

    /**
     * 获得单位类型
     */
    getUnitType() {
        return OrgTypeEnum.UNIT;
    }

    //#endregion

    /**
     * 搜索定位
     */
    selectorTreeNodeScrollPosition() {
        setTimeout(() => {
            let _node: any;
            [_node] = this._unitTreeElement.getSelectedNodeList();
            const el = <HTMLElement>_node.component.dragElement.nativeElement;
            this._scrollViewportDrawer.scrollToOffset(el.offsetTop);
        }, 300);
    }
    asyncLoadNodeChildNode(orgId: string) {
        return this.service
            .getOrgUnitTree({
                ORG_GROUP_ID: this.currentOrg.groupValue,
                SYS_PARENT: orgId,
            })
            .toPromise();
    }
    //#endregion

    //#region 账本相关

    addLedgerData(data: any, okFn: () => void) {
        this.service.addLedgerData(data).subscribe(result => {
            if (result) {
                this.ledgerChildTab.loadTabData();
            }
            okFn();
        });
    }
    getLedgerParams() {
        const { pageSize, pageIndex } = this.ledgerTbl;
        const { TABLE_NAME, childTabItemID, A0101ItemID } = this.ledgerTab;
        const { activedNode } = this.currentOrg;
        const filterCondition = [
            this.ledgerTbl.filterFields.result,
            {
                [A0101ItemID]: this.ledgerTbl.searchValue,
            },
        ].filter(v => Object.keys(v).length > 0);
        const params = {
            $PAGE_INDEX$: pageIndex,
            $PAGE_SIZE$: pageSize,
            YEAR: this.currentYear,
            LEDGER_TYPE: this.ledgerType,
            TABLE_NAME: TABLE_NAME,
            WAY: childTabItemID
                ? {
                      [childTabItemID]: this.ledgerChildTab.value,
                  }
                : null,
            $FILTER_CONDITION$: filterCondition,
            QUERY_ORG_LIST: [
                {
                    DATA_UNIT_ORG_ID: activedNode.key || '',
                    ORG_B01_ID: activedNode.unitId,
                    ORG_TYPE: activedNode.nodeType,
                    $TREE_INCLUDE_LOWER_LEVEL$: this.currentOrg.isInclude,
                },
            ],
        };
        if (this.URLParams) {
            params[`${this.wfTableCode.getTableCode('A01')}_ID`] = this.URLParams;
        }
        return params;
    }
    /**
     * 构建表单
     */
    buildPageInfo(planName: string, okFn: (fields: any[], formGroup: FormGroup) => void) {
        this.common.getSchemeContent(planName).subscribe(result => {
            if (result) {
                const tabValue = this.ledgerTab.data[this.ledgerTab.selectedIndex].value;
                const item = result.systemSchemeList.find(v => {
                    return v.systemSchemeTable.TABLE_CODE === tabValue;
                });
                if (!item) {
                    this.message.error(`界面方案：ledger_add_record中${tabValue}子集未配置界面`);
                    return;
                }
                const { systemSchemeEdit } = item;
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
                okFn(systemSchemeEdit, formGroup);
            }
        });
    }

    /**
     * 同步更新账本数据
     */
    syncUpdate() {
        // this.ledgerTbl.isLoading = true;
        const params = this.getLedgerParams();
        this.service.syncUpdate(params).subscribe(result => {
            if (result) {
                this.ledgerTab.init();
            }
            // this.ledgerTbl.isLoading = false;
        });
    }
    canSyncUpdate() {
        const filterArr = [
            this.wfTableCode.getTableCode('A72'),
            this.wfTableCode.getTableCode('A74'),
            this.wfTableCode.getTableCode('A75'),
        ];
        return filterArr.indexOf(this.ledgerTab.TABLE_NAME) > -1;
    }

    /**
     * 校验账本
     */
    checkLedger() {
        this._appLedgerCheck.checkData();
    }
    //#region

    loadRouterParams() {
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
            }
        });
    }
}
