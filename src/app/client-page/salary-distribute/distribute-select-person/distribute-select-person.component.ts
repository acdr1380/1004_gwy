import { WorkflowService } from 'app/workflow/workflow.service';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DbTypeEnum } from 'app/workflow/enums/DbTypeEnum';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
@Component({
    selector: 'distribute-select-person',
    templateUrl: './distribute-select-person.component.html',
    styleUrls: ['./distribute-select-person.component.scss'],
})
export class DistributeSelectPersonComponent implements OnInit {
    unitId;
    unitName;
    userInfo = this.commonService.getUserLoginInfo(); // 用户参数
    @Input() isSelectUnit = false; // 是否选择单位
    @Input() isImportSelf = false; // 是否自定义导人方法
    @Input() jobStepInfo: JobStepInfo;
    @Output() selectedChange = new EventEmitter<any>(); // 选人后执行
    @ViewChild('OrgTreeElement', { static: false }) OrgTreeElement: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false }) scrollViewport: CdkVirtualScrollViewport;
    @ViewChild('personTableTemp', { static: false }) personTableTemp;

    constructor(
        private commonService: CommonService,
        private workflowService: WorkflowService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    checkUnit = {};
    checkPerson = {
        title: '选择人员',
        width: 560,
        visible: false,
        close: () => (this.checkPerson.visible = false),
        open: () => (this.checkPerson.visible = true),
        find: {
            searchWidth: 380,
            placeholder: '输入关键字查询',
            searchKey: null,
            list: [],
            // 选择搜索项触发
            evtModelChange: event => {
                let origin: any = {};
                if (this.selectPersonIfy.unitify.activedNode) {
                    origin = this.selectPersonIfy.unitify.activedNode.origin;
                }
                const data = {
                    DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                    A0103: '01',
                    UNIT_TYPE: '02',
                    ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                    ORG_TYPE: origin.ORG_TYPE || 1,
                };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] = event;
                this.workflowService.queryPersonRowNumber(data).subscribe(num => {
                    this.selectPersonIfy.tableIfy.pageIndex =
                        parseInt((num / this.selectPersonIfy.tableIfy.pageSize).toString()) + 1;
                    this.selectPersonIfy.tableIfy.selectRowIndex =
                        num % this.selectPersonIfy.tableIfy.pageSize;
                    this.personTableTemp?.cdkVirtualScrollViewport?.scrollToIndex(num);
                });
            },
            // 搜索关键字改变触发
            evtSearch: event => {
                if (event) {
                    let origin: any = {};
                    if (this.selectPersonIfy.unitify.activedNode) {
                        origin = this.selectPersonIfy.unitify.activedNode.origin;
                    }
                    const data = {
                        DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                        A0103: '01',
                        UNIT_TYPE: '02',
                        A0101: event.trim(),
                        ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                        ORG_TYPE: origin.ORG_TYPE || 1,
                    };
                    this.workflowService
                        .queryPersonList(data)
                        .subscribe(result => (this.selectPersonIfy.find.list = result));
                }
            },
            // 获取焦点触发
            evtFocus: () => {
                this.selectPersonIfy.find.searchKey = null;
            },
        },
    };
    selectedPerson = {};
    // 选择人员
    selectPersonIfy = {
        title: '选择人员',
        width: 560,
        visible: false,
        list: [],
        evtDelete: item => {
            this.selectPersonIfy.tableIfy.evtRefreshStatus(false, item);
        },
        evtSwitchUnit: () => {
            this.selectPersonIfy.unitify.open();
        },
        close: () => (this.selectPersonIfy.visible = false),
        open: () => {
            this.selectPersonIfy.visible = true;
            if (!this.selectPersonIfy.list.length) {
                this.selectPersonIfy.tableIfy.evtDataChange(true);
            }
        },
        find: {
            searchWidth: 300,
            placeholder: '输入关键字查询',
            searchKey: null,
            list: [],
            // 选择搜索项触发
            evtModelChange: event => {
                let origin: any = {};
                if (this.selectPersonIfy.unitify.activedNode) {
                    origin = this.selectPersonIfy.unitify.activedNode.origin;
                }
                const data = {
                    DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                    A0103: '01',
                    UNIT_TYPE: '02',
                    ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                    ORG_TYPE: origin.ORG_TYPE || 1,
                };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] = event;
                this.workflowService.queryPersonRowNumber(data).subscribe(num => {
                    this.selectPersonIfy.tableIfy.pageIndex =
                        parseInt((num / this.selectPersonIfy.tableIfy.pageSize).toString()) + 1;
                    this.selectPersonIfy.tableIfy.selectRowIndex =
                        num % this.selectPersonIfy.tableIfy.pageSize;
                    this.personTableTemp?.cdkVirtualScrollViewport?.scrollToIndex(num);
                });
            },
            // 搜索关键字改变触发
            evtSearch: event => {
                if (event) {
                    let origin: any = {};
                    if (this.selectPersonIfy.unitify.activedNode) {
                        origin = this.selectPersonIfy.unitify.activedNode.origin;
                    }
                    const data = {
                        DATA_UNIT_ORG_ID: origin.DATA_UNIT_ORG_ID,
                        A0103: '01',
                        UNIT_TYPE: '02',
                        A0101: event.trim(),
                        ORG_B01_ID: origin.ORG_B01_ID || this.userInfo.unitId,
                        ORG_TYPE: origin.ORG_TYPE || 1,
                    };
                    this.workflowService
                        .queryPersonList(data)
                        .subscribe(result => (this.selectPersonIfy.find.list = result));
                }
            },
            // 获取焦点触发
            evtFocus: () => {
                this.selectPersonIfy.find.searchKey = null;
            },
        },
        tableIfy: {
            result: [],
            pageIndex: 1,
            pageSize: 7,
            totalCount: 0,
            selectRowIndex: -1,
            allChecked: true,
            indeterminate: false,
            seletedLineIndex: -1,
            unitify: '',
            evtDataChange: (reset: boolean = false, isSelectRow: boolean = false) => {
                this.selectPersonIfy.list = [];
                if (reset) {
                    this.selectPersonIfy.tableIfy.allChecked = false;
                    this.selectPersonIfy.tableIfy.pageIndex = 1;
                }
                if (!isSelectRow) {
                    this.selectPersonIfy.tableIfy.selectRowIndex = -1;
                }
                let { DATA_UNIT_ORG_ID, ORG_TYPE, ORG_B01_ID, ORG_NAME } = this.selectPersonIfy
                    .unitify.activedNode
                    ? this.selectPersonIfy.unitify.activedNode.origin
                    : <any>{};
                if (this.selectPersonIfy.unitify.activedNode) {
                    this.selectPersonIfy.tableIfy.unitify = ORG_NAME;
                    const data = {
                        // $PAGE_INDEX$: this.selectPersonIfy.tableIfy.pageIndex,
                        $PAGE_SIZE$: 99999999,
                        $QUERY_FIELDS$: 'A0101,A0184,A0107,A0104',
                        A0103: '01',
                        UNIT_TYPE: '02',
                        DATA_UNIT_ORG_ID,
                        ORG_B01_ID,
                        ORG_TYPE,
                    };
                    this.workflowService.selectPsnTblData(data).subscribe(result => {
                        this.selectPersonIfy.tableIfy.result = result.result;
                        this.selectPersonIfy.tableIfy._setChekced();
                        this.selectPersonIfy.tableIfy.evtCheckAll(true);
                    });
                }
            },
            evtCheckAll: event => {
                this.selectPersonIfy.tableIfy.result.forEach(item => {
                    item.checked = event;
                    this.selectPersonIfy.tableIfy.evtRefreshStatus(event, item);
                });
                this.selectPersonIfy.tableIfy.evtRefreshStatus();
                this.selectPersonIfy.tableIfy.indeterminate = false;
            },
            evtRefreshStatus: (event?: boolean, data?) => {
                if (data) {
                    // 全选排除已选择的
                    data.checked = event;
                    const index = this.selectPersonIfy.list.findIndex(
                        v =>
                            v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            data[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    // 添加
                    if (event && index === -1) {
                        this.selectPersonIfy.list.push(data);
                    }
                    // 排除已选择的
                    if (!event && index > -1) {
                        this.selectPersonIfy.list.splice(index, 1);
                        this.selectPersonIfy.tableIfy.result.find(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                data[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ).checked = false;
                    }
                }
                this.selectPersonIfy.tableIfy.allChecked =
                    this.selectPersonIfy.tableIfy.result.every(item => item.checked);
                if (this.selectPersonIfy.tableIfy.allChecked) {
                    this.selectPersonIfy.tableIfy.indeterminate = false;
                } else {
                    this.selectPersonIfy.tableIfy.indeterminate =
                        this.selectPersonIfy.tableIfy.result.some(item => item.checked);
                }
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
            //定位机构树节点
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
            // 查询子节点
            _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
                return this.workflowService
                    .getOrgUnitTree(this.selectPersonIfy.unitify.groupIfy.value, node.key)
                    .toPromise();
            },
            // 滚动到定位节点位置
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.selectPersonIfy.unitify.activedNode;
                    const el = <HTMLElement>node.component.dragElement.nativeElement;
                    this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
            // 定位机构树节点后执行
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
                this.selectedChange.emit({
                    unitId: this.selectPersonIfy.unitify.activedNode?.origin?.DATA_UNIT_ORG_ID,
                    b01Id: this.selectPersonIfy.unitify.activedNode?.origin?.ORG_B01_ID,
                    unitName: this.selectPersonIfy.unitify.activedNode?.origin?.ORG_NAME,
                    list: list,
                });
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

    // 显示选人抽屉
    show() {
        this.selectPersonIfy.open();
    }
}
