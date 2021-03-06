import { WorkflowService } from 'app/workflow/workflow.service';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DbTypeEnum } from 'app/workflow/enums/DbTypeEnum';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oper-select-person',
    templateUrl: './oper-select-person.component.html',
    styleUrls: ['./oper-select-person.component.scss'],
})
export class OperSelectPersonComponent implements OnInit {
    /**
     * 业务信息
     */
    @Input() jobStepInfo: JobStepInfo;

    /**
     * 排除人员
     */
    @Input() disabledList = []; // ['10002315541252', '100023155412555']
    @Output() disabledListChange = new EventEmitter<any>();
    /**
     * 附加筛选条件参数
     */
    @Input() filterParmas = <any>null;

    /**
     * 是否选择单位
     */
    @Input() isSelectUnit = false;
    /**
     * 是否自定义导人方法
     */
    @Input() isImportSelf = false;

    /**
     * 选人后执行
     */
    @Output() selectedChange = new EventEmitter<any>();

    /**
     * 用户参数
     */
    userInfo = this.commonService.getUserLoginInfo();

    //#region 选择人员

    @ViewChild('OrgTreeElement', { static: false }) OrgTreeElement: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    /**
     * 选择人员
     */
    selectPersonIfy = {
        title: '选择人员',
        width: 560,
        visible: false,
        close: () => (this.selectPersonIfy.visible = false),
        open: () => {
            this.selectPersonIfy.tableIfy.evtDataChange(true);
            this.selectPersonIfy.visible = true;
        },

        find: {
            searchWidth: 380,
            placeholder: '输入关键字查询',
            nzFilterOption: () => true,

            searchKey: null,
            list: [],

            evtModelChange: event => {
                let origin: any = {};
                if (this.selectPersonIfy.unitify.activedNode) {
                    origin = this.selectPersonIfy.unitify.activedNode.origin;
                }
                const data = {
                    DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                    A0103: '01',
                    UNIT_TYPE: '03',
                    $PAGE_INDEX$: this.selectPersonIfy.tableIfy.pageIndex,
                    $PAGE_SIZE$: this.selectPersonIfy.tableIfy.pageSize,
                    ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                    ORG_TYPE: origin.ORG_TYPE || 1,
                };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] = event;
                if (this.filterParmas) {
                    Object.assign(data, this.filterParmas);
                }
                this.workflowService.queryPersonRowNumber(data).subscribe(num => {
                    this.selectPersonIfy.tableIfy.pageIndex =
                        // tslint:disable-next-line:radix
                        parseInt((num / this.selectPersonIfy.tableIfy.pageSize).toString()) + 1;
                    this.selectPersonIfy.tableIfy.selectRowIndex =
                        num % this.selectPersonIfy.tableIfy.pageSize;
                    this.selectPersonIfy.tableIfy.evtDataChange(false, true);
                });
            },
            evtSearch: event => {
                if (event) {
                    // const orgId =
                    //     this.selectPersonIfy.unitify.activedNode.key || this.userInfo.unitId;

                    let origin: any = {};
                    if (this.selectPersonIfy.unitify.activedNode) {
                        origin = this.selectPersonIfy.unitify.activedNode.origin;
                    }
                    const data = {
                        DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                        A0103: '01',
                        UNIT_TYPE: '03',
                        $PAGE_INDEX$: this.selectPersonIfy.tableIfy.pageIndex,
                        $PAGE_SIZE$: this.selectPersonIfy.tableIfy.pageSize,
                        A0101: event.trim(),
                        ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                        ORG_TYPE: origin.ORG_TYPE || 1,
                    };
                    if (this.filterParmas) {
                        Object.assign(data, this.filterParmas);
                    }
                    this.workflowService
                        .queryPersonList(data)
                        .subscribe(result => (this.selectPersonIfy.find.list = result));
                }
            },
            evtFocus: () => {
                this.selectPersonIfy.find.searchKey = null;
            },
        },
        list: [],
        evtDelete: item => {
            this.selectPersonIfy.tableIfy.evtRefreshStatus(false, item);
        },

        evtSwitchUnit: () => {
            this.selectPersonIfy.unitify.open();
        },

        tableIfy: {
            result: [],
            pageIndex: 1,
            pageSize: 7,
            totalCount: 0,
            selectRowIndex: -1,
            allChecked: false,
            indeterminate: false,
            seletedLineIndex: -1,
            unitify: '',
            evtDataChange: (reset: boolean = false, isSelectRow: boolean = false) => {
                // this.selectPersonIfy.list = [];

                if (reset) {
                    this.selectPersonIfy.tableIfy.allChecked = false;
                    this.selectPersonIfy.tableIfy.pageIndex = 1;
                }

                if (!isSelectRow) {
                    this.selectPersonIfy.tableIfy.selectRowIndex = -1;
                }
                // const orgId = this.selectPersonIfy.unitify.activedNode.key || this.userInfo.unitId;
                let { DATA_UNIT_ORG_ID, ORG_TYPE, ORG_B01_ID, ORG_NAME } = this.selectPersonIfy
                    .unitify.activedNode
                    ? this.selectPersonIfy.unitify.activedNode.origin
                    : <any>{};
                if (!this.selectPersonIfy.unitify.activedNode) {
                    DATA_UNIT_ORG_ID = this.userInfo.unitId;
                    ORG_TYPE = OrgTypeEnum.UNIT;
                    ORG_B01_ID = this.userInfo.unitId;
                    ORG_NAME = this.userInfo.unitName;
                }

                this.selectPersonIfy.tableIfy.unitify = ORG_NAME;
                const data = {
                    $PAGE_INDEX$: this.selectPersonIfy.tableIfy.pageIndex,
                    $PAGE_SIZE$: this.selectPersonIfy.tableIfy.pageSize,
                    $QUERY_FIELDS$: 'A0101,A0184,A0107,A0104',
                    A0103: '01',
                    UNIT_TYPE: '03',
                    DATA_UNIT_ORG_ID,
                    ORG_B01_ID,
                    ORG_TYPE,
                };
                if (this.filterParmas) {
                    Object.assign(data, this.filterParmas);
                }
                this.workflowService.selectPsnTblData(data).subscribe(result => {
                    if (result.totalCount === 0) {
                        result.totalCount = this.selectPersonIfy.tableIfy.totalCount;
                    }
                    if (result.totalCount > 0) {
                        this.selectPersonIfy.tableIfy = Object.assign(
                            this.selectPersonIfy.tableIfy,
                            result
                        );
                    }
                    if (this.selectPersonIfy.tableIfy.result.length > 0) {
                        this.selectPersonIfy.tableIfy.result.forEach(item => {
                            const index = this.disabledList.findIndex(
                                v => v === item[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            item.disabled = index > -1 ? true : false;
                            item.checked = false;
                        });
                        this.selectPersonIfy.tableIfy.result = [
                            ...this.selectPersonIfy.tableIfy.result,
                        ];
                    }
                    this.selectPersonIfy.tableIfy._setChekced();
                });
            },
            evtCheckAll: event => {
                this.selectPersonIfy.tableIfy.result.forEach(item => {
                    // 全选排除已选择的
                    if (
                        this.disabledList.findIndex(
                            x => x === item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) === -1
                    ) {
                        item.checked = event;
                    }
                    this.selectPersonIfy.tableIfy.evtRefreshStatus(event, item);
                });
                this.selectPersonIfy.tableIfy.evtRefreshStatus();
            },
            evtRefreshStatus: (event?: boolean, data?) => {
                if (data) {
                    // 全选排除已选择的
                    if (
                        this.disabledList.findIndex(
                            x => x === data[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) === -1
                    ) {
                        data.checked = event;
                    }
                    const index = this.selectPersonIfy.list.findIndex(
                        v =>
                            v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            data[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    // 排除已选择的
                    if (
                        event &&
                        index === -1 &&
                        this.disabledList.findIndex(
                            x => x === data[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) === -1
                    ) {
                        this.selectPersonIfy.list.push(data);
                    }
                    // 排除已选择的
                    if (
                        !event &&
                        index > -1 &&
                        this.disabledList.findIndex(
                            x => x === data[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) === -1
                    ) {
                        this.selectPersonIfy.list.splice(index, 1);
                        this.selectPersonIfy.tableIfy.result.find(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                data[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ).checked = false;
                    }
                }

                // 处理所有表格项选完 但是选择所有状态不改变
                const arr = this.selectPersonIfy.tableIfy.result.map(x => {
                    if (
                        this.disabledList.findIndex(
                            m => m === x[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) > -1
                    ) {
                        return {
                            ...x,
                            checked: true,
                        };
                    }
                    return x;
                });
                this.selectPersonIfy.tableIfy.allChecked = arr.every(item => item.checked);
            },
            _setChekced: () => {
                this.selectPersonIfy.tableIfy.result.forEach(item => {
                    const index = this.selectPersonIfy.list.findIndex(
                        v =>
                            v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            item[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    item.checked = index > -1 && !item.disabled;
                    if (!item.checked) {
                        const i = this.selectPersonIfy.list.findIndex(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                        if (i > -1) {
                            this.selectPersonIfy.list.splice(i, 1);
                            this.selectPersonIfy.list = [...this.selectPersonIfy.list];
                        }
                    }
                });
                this.selectPersonIfy.tableIfy.allChecked =
                    this.selectPersonIfy.tableIfy.result.every(item => item.checked);
            },
        },

        unitify: {
            title: '选择单位',
            width: 460,
            visible: false,
            close: () => (this.selectPersonIfy.unitify.visible = false),
            open: () => {
                this.selectPersonIfy.unitify.visible = true;
                this.selectPersonIfy.unitify.groupIfy._loadGroupList();
            },

            groupIfy: {
                searchWidth: 440,
                list: [],
                value: null,
                evtChange: () => {
                    this.selectPersonIfy.unitify.activedNode = null;
                    this.selectPersonIfy.unitify._loadOrgList();
                },

                _loadGroupList: () => {
                    if (this.selectPersonIfy.unitify.groupIfy.list.length > 0) {
                        return;
                    }
                    this.workflowService.getOrgGroupList().subscribe(result => {
                        this.selectPersonIfy.unitify.groupIfy.list = result;
                        const [first] = result;
                        this.selectPersonIfy.unitify.groupIfy.value = first.DATA_UNIT_ORG_GROUP_ID;

                        this.selectPersonIfy.unitify._loadOrgList();
                    });
                },
            },

            find: {
                searchWidth: 440,
                placeholder: '输入关键字查询',
                nzFilterOption: () => true,

                searchKey: null,
                list: [],
                parentList: [],

                evtModelChange: event => {
                    this.workflowService.getOrgParentAllList(event).subscribe(result => {
                        this.selectPersonIfy.unitify.find.parentList = result;
                        const nodes = this.OrgTreeElement.getTreeNodes();
                        this.selectPersonIfy.unitify._selectedLocationOrg(nodes, event);
                    });
                },
                evtSearch: event => {
                    if (event) {
                        this.workflowService
                            .selectListByQuery(
                                this.selectPersonIfy.unitify.groupIfy.value,
                                event.trim()
                            )
                            .subscribe(result => {
                                this.selectPersonIfy.unitify.find.list = result;
                            });
                    }
                },
                evtFocus: () => {
                    this.selectPersonIfy.unitify.find.searchKey = null;
                },
            },

            nodes: [],
            nzSelectedKeys: [],
            nzExpandedKeys: [],
            activedNode: <NzTreeNode>null,
            icons: ['sitemap', 'server', 'building-o'],
            expandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;
                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.workflowService
                            .getOrgUnitTree(this.selectPersonIfy.unitify.groupIfy.value, node.key)
                            .subscribe(result => node.addChildren(result));
                    }
                }
            },
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.selectPersonIfy.unitify.activedNode = data.node;
                this.selectPersonIfy.unitify.close();
                this.selectPersonIfy.tableIfy.evtDataChange();
            },
            _loadOrgList: () => {
                this.workflowService
                    .getOrgUnitTree(this.selectPersonIfy.unitify.groupIfy.value)
                    .subscribe(result => {
                        this.selectPersonIfy.unitify.nodes = result;
                    });
            },

            /**
             * 定位机构树节点
             */
            _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
                nodes.forEach(async node => {
                    if (loctionOrg === node.key) {
                        this.selectPersonIfy.unitify.activedNode = node;
                        this.selectPersonIfy.unitify._locationedContinue();
                        this.selectPersonIfy.unitify._locationedScroll();
                    } else {
                        const isExist =
                            this.selectPersonIfy.unitify.find.parentList.findIndex(
                                v => v.DATA_UNIT_ORG_ID === node.key
                            ) > -1;
                        if (isExist) {
                            node.isExpanded = true;
                            // 有子节点并且未取出来
                            if (!node.isLeaf && node.getChildren().length === 0) {
                                const childNodes =
                                    await this.selectPersonIfy.unitify._asyncLoadNodeChildNode(
                                        node
                                    );
                                node.addChildren(childNodes);
                            }
                            if (node.getChildren().length > 0) {
                                this.selectPersonIfy.unitify._selectedLocationOrg(
                                    node.children,
                                    loctionOrg
                                );
                            }
                        }
                    }
                });
            },
            /*
             * 查询子节点
             */
            _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
                return this.workflowService
                    .getOrgUnitTree(this.selectPersonIfy.unitify.groupIfy.value, node.key)
                    .toPromise();
            },
            /*
             * 滚动到定位节点位置
             */
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.selectPersonIfy.unitify.activedNode;
                    const el = <HTMLElement>node.component.dragElement.nativeElement;
                    this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
            /*
             * 定位机构树节点后执行
             */
            _locationedContinue: () => {
                this.selectPersonIfy.tableIfy.evtDataChange(true);
            },
        },

        loading: false,
        evtSelectedPerson: () => {
            const list = this.selectPersonIfy.list;
            if (list.length === 0) {
                this.message.warning('未取到选择人员数据,请选择人员后重试!');
                return;
            }

            if (this.isImportSelf) {
                this.selectedChange.emit(list);
                this.selectPersonIfy.close();
                return;
            }

            const personIds = list.map(v => v[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                dbType: DbTypeEnum.PERSON,
                wheres: [
                    {
                        fieldId: 'keyId',
                        operator: 'in',
                        value: personIds,
                    },
                ],
            };
            this.selectPersonIfy.loading = true;
            this.workflowService.importPerson(this.jobStepInfo.wfId, params).subscribe(json => {
                this.selectPersonIfy.loading = false;
                if (json.code === 0) {
                    this.selectPersonIfy.close();
                    this.selectedChange.emit(list);
                }
            });
        },
    };

    //#endregion 选择人员

    constructor(
        private commonService: CommonService,
        private workflowService: WorkflowService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    /**
     * 显示选人抽屉
     */
    show() {
        this.selectPersonIfy.list = [];
        this.selectPersonIfy.open();
    }
}
