import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LedgerManageService } from './ledger-manage.service';
import { Observable } from 'rxjs';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import * as _ from 'lodash';
import LegerConfig from './assets/ledger-config/ledger-config';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { CommonService } from 'app/util/common.service';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClientService } from 'app/master-page/client/client.service';

declare global {
    interface Object {
        fromEntries: Function;
    }
}

@Component({
    selector: 'app-ledger-manage',
    templateUrl: './ledger-manage.component.html',
    styleUrls: ['./ledger-manage.component.scss'],
})
export class LedgerManageComponent implements OnInit {
    URLParams: { [key: string]: string };
    // 字段类型
    columnTypeEnum = ColumnTypeEnum;
    // 是否包含下层
    incSub = false;
    searchList$ = new Observable<any>();
    // 是否过滤机构树为虚拟节点
    IS_FILTER_AFFILIATION = false;
    // 机构查询下拉列表
    searchSelect = {
        placeholder: '请输入关键字搜索',
        value: null,
        nzFilterOption: () => true,
        listOfOption: [],
        Parents: [],
        orgid: null,
    };
    // 当前单位：默认为账号所在单位，选择机构后切换
    get selectedNode() {
        const { activedNode } = this.selectOrgDrawer.orgTreeIfy.tree;
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
    @ViewChild('OrgTree', { static: false }) _orgTree: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false }) private _scrollViewport: CdkVirtualScrollViewport;
    @ViewChild('unitTreeElement', { static: false }) private _unitTreeElement: NzTreeComponent;
    @ViewChild('scrollViewportDrawer', { static: false })
    private _scrollViewportDrawer: CdkVirtualScrollViewport;

    // 年份列表
    ledgerYearSelect = {
        value: new Date().getFullYear().toString(),
        data: [],
        init: () => {
            this.service.getLedgerYears().subscribe(result => {
                if (!result) {
                    return;
                }
                const ledgerYearSelect = this.ledgerYearSelect;
                ledgerYearSelect.data = Object.assign(ledgerYearSelect.data, result);
                ledgerYearSelect.value = result.length > 0 ? result[0].value : '';

                // 初始化账本类别
                this.ledgerTypeSelect.init();
            });
        },
    };
    // 账本类别列表
    ledgerTypeSelect = {
        value: LegerConfig[0].value,
        data: [],
        init: () => {
            this.ledgerTypeSelect.data = LegerConfig.map(v => {
                return {
                    value: v.value,
                    labelName: v.labelName,
                };
            });
            this.ledgerTypeSelect.value = LegerConfig[0].value;
        },
        evtModelChange: value => {
            const key = '201903'; // 班子表标识
            // 选项为班子表时过滤机构树为虚拟节点并且ORG_AFFILIATION不为空
            this.IS_FILTER_AFFILIATION = key === value;
            this.loadOrgTree();
        },
    };

    // 选择单位抽屉
    selectOrgDrawer = {
        title: '选择单位',
        width: 400,
        visible: false,
        close: () => {
            this.selectOrgDrawer.visible = false;
        },
        open: () => {
            this.selectOrgDrawer.visible = true;
        },
        orgTreeIfy: {
            // 分组
            group: {
                list: [],
                value: null,
                evtChange: () => {
                    this.selectOrgDrawer.orgTreeIfy.tree.activedNode = null;
                    // this.personTableIfy._evtReset();
                    this.loadOrgTree();
                },
            },
            // 是否包含下层
            level: {
                yeNo: false,
                evtLevelChange: () => {
                    if (this.selectedNode) {
                    }
                },
            },
            // 机构树查找
            find: {
                list: [],
                parentList: [],
                keyword: null,
                isSearching: false,
                evtOpenChange: status => {
                    if (status) {
                        this.selectOrgDrawer.orgTreeIfy.find.keyword = null;
                    }
                },
                evtOnSearch: (keyword: string) => {
                    if (keyword) {
                        const { find } = this.selectOrgDrawer.orgTreeIfy;
                        find.isSearching = true;
                        this.service
                            .selectListByQuery(
                                this.selectOrgDrawer.orgTreeIfy.group.value,
                                keyword.trim()
                            )
                            .subscribe(result => {
                                find.isSearching = false;
                                return (find.list = result);
                            });
                    }
                },
                evtChange: value => {
                    this.service.getOrgParentAllList(value).subscribe(result => {
                        this.selectOrgDrawer.orgTreeIfy.find.parentList = result;
                        const nodes = this._orgTree.getTreeNodes();
                        this.selectOrgDrawer.orgTreeIfy.tree._selectedLocationOrg(nodes, value);
                    });
                },
            },
            // 机构树
            tree: {
                nodes: [],
                nodeIcon: ['sitemap', 'server', 'building-o'],
                activedNode: <NzTreeNode>null,
                evtActiveNode: (data: NzFormatEmitEvent) => {
                    this.selectOrgDrawer.orgTreeIfy.tree.activedNode = data.node;
                },
                evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                    if (event.eventName === 'expand') {
                        const node = event.node;
                        if (node && node.getChildren().length === 0 && node.isExpanded) {
                            this.service
                                .getOrgUnitTree({
                                    ORG_GROUP_ID: this.selectOrgDrawer.orgTreeIfy.group.value,
                                    SYS_PARENT: node.key,
                                    IS_FILTER_AFFILIATION: this.IS_FILTER_AFFILIATION,
                                })
                                .subscribe(nodes => node.addChildren(nodes));
                        }
                    }
                },
                /**
                 * 定位机构树节点
                 */
                _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
                    nodes.forEach(async node => {
                        if (loctionOrg === node.key) {
                            this.selectOrgDrawer.orgTreeIfy.tree.activedNode = node;
                            this.selectOrgDrawer.orgTreeIfy.tree._locationedContinue();
                            this.selectOrgDrawer.orgTreeIfy.tree._locationedScroll();
                        } else {
                            const isExist =
                                this.selectOrgDrawer.orgTreeIfy.find.parentList.findIndex(
                                    v => v.DATA_UNIT_ORG_ID === node.key
                                ) > -1;
                            if (isExist) {
                                node.isExpanded = true;
                                // 有子节点并且未取出来
                                if (!node.isLeaf && node.getChildren().length === 0) {
                                    const childNodes = await this.selectOrgDrawer.orgTreeIfy.tree._asyncLoadNodeChildNode(
                                        node
                                    );
                                    node.addChildren(childNodes);
                                }
                                if (node.getChildren().length > 0) {
                                    this.selectOrgDrawer.orgTreeIfy.tree._selectedLocationOrg(
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
                    return this.service
                        .getOrgUnitTree({
                            ORG_GROUP_ID: this.selectOrgDrawer.orgTreeIfy.group.value,
                            SYS_PARENT: node.key,
                            IS_FILTER_AFFILIATION: this.IS_FILTER_AFFILIATION,
                        })
                        .toPromise();
                },
                /*
                 * 滚动到定位节点位置
                 */
                _locationedScroll: () => {
                    setTimeout(() => {
                        const node: any = this.selectOrgDrawer.orgTreeIfy.tree.activedNode;
                        const el = <HTMLElement>node.component.dragElement.nativeElement;
                        this._scrollViewport.scrollToOffset(el.offsetTop - 30);
                    }, 100);
                },
                /*
                 * 定位机构树节点后执行
                 */
                _locationedContinue: () => {
                    // this.personTableIfy.evtPageChange(true);
                },
            },
        },
    };

    // 当前账号信息
    sessionUser = this.common.getUserLoginInfo();

    constructor(
        private service: LedgerManageService,
        private clientService: ClientService,
        private message: NzMessageService,
        private modalService: NzModalService,
        private common: CommonService
    ) { }

    ngOnInit() {
        // 面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '账本管理',
            },
        ]);
        this.loadOrgGroupList();
        // 初始化账本年份
        this.ledgerYearSelect.init();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    //#region 公用方法
    createMessage(type: string, msg: string) {
        this.message.create(type, msg);
    }
    //#endregion

    //#region 人员相关
    exportTbl() { }
    //#endregion

    //#region 机构相关

    /**
     * 加载机构分组
     */
    loadOrgGroupList() {
        this.service.getOrgGroupList().subscribe(result => {
            this.selectOrgDrawer.orgTreeIfy.group.list = result;
            const [first] = result;
            this.selectOrgDrawer.orgTreeIfy.group.value = first.value;
            this.loadOrgTree();
        });
    }

    /**
     * 查询机构树
     */
    loadOrgTree() {
        const params = {
            ORG_GROUP_ID: this.selectOrgDrawer.orgTreeIfy.group.value,
            SYS_PARENT: '-1',
            IS_FILTER_AFFILIATION: this.IS_FILTER_AFFILIATION,
        };
        this.service
            .getOrgUnitTree(params)
            .subscribe(result => (this.selectOrgDrawer.orgTreeIfy.tree.nodes = result));
    }

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
                ORG_GROUP_ID: this.selectOrgDrawer.orgTreeIfy.group.value,
                SYS_PARENT: orgId,
                IS_FILTER_AFFILIATION: this.IS_FILTER_AFFILIATION,
            })
            .toPromise();
    }
    //#endregion
}
