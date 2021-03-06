import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { UnitManageService } from '../unit-manage.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'app/util/common.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { debounceTime, timeInterval } from 'rxjs/operators';
import { UnitMsgViewComponent } from '../unit-msg-view/unit-msg-view.component';
import { UnitRecoverViewComponent } from '../unit-recover-view/unit-recover-view.component';
import { UnitTransferViewComponent } from '../unit-transfer-view/unit-transfer-view.component';
import { UnitSortViewComponent } from '../unit-sort-view/unit-sort-view.component';
import { UnitBatchTransferViewComponent } from '../unit-batch-transfer-view/unit-batch-transfer-view.component';
import { UnitCheckViewComponent } from '../unit-check-view/unit-check-view.component';
import { ClientService } from 'app/master-page/client/client.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-main-view',
    templateUrl: './unit-main-view.component.html',
    styleUrls: ['./unit-main-view.component.scss'],
})
export class UnitMainViewComponent implements OnInit, AfterViewInit, OnDestroy {
    
    @ViewChild('orgUnitElement', { static: false }) private orgTreeEl: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;
    /** 机构树及其相关 */
    orgTreeIfy = {
        // 机构分组
        group: {
            list: [],
            value: null,
            valueChange: () => {},
            loadList: () => {
                this.service.getOrgGroupList().subscribe(result => {
                    this.orgTreeIfy.group.list = result;
                    const [first] = result;
                    this.orgTreeIfy.group.value = first.value;
                    this.loadOrgTree();
                });
            },
        },
        // 搜索
        find: {
            value: null,
            list: [],
            parentList: [],
            searchKey$: new Subject<string>(),
            evtOnSearch: (value: string) => {
                if (value) {
                    this.service
                        .selectListByQuery(this.orgTreeIfy.group.value, value.trim())
                        .subscribe(result => (this.orgTreeIfy.find.list = result));
                }
            },
            // 选中的optiong改变回调
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.orgTreeIfy.find.parentList = result;
                    const nodes = this.orgTreeEl.getTreeNodes();
                    this.orgTreeIfy.tree._selectedLocationOrg(nodes, value);
                });
            },
        },
        // 树
        tree: {
            nodes: [],
            nodeIcon: ['sitemap', 'server', 'building-o'],
            activeNode: <NzTreeNode>null,
            isInclude: false,
            includeChange: event => {
                this.orgTreeIfy.tree.isInclude = event;
                this.unitTableIfy.loadRows();
            },
            // 点击节点数触发
            evtActiveNode: (data: any) => {
                this.orgTreeIfy.tree.activeNode = data.node || data;
                // 加载表格
                this.unitTableIfy.loadRows();
            },
            // 点击展开树节点图标触发
            evtChangeNode: (event: NzFormatEmitEvent) => {
                if (event.eventName === 'expand') {
                    const node = event.node;
                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getTreeData(this.orgTreeIfy.group.value, node.key)
                            .subscribe(nodes => node.addChildren(nodes));
                    }
                }
            },
            // 定位机构树节点
            _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
                nodes.forEach(async node => {
                    if (loctionOrg === node.key) {
                        this.orgTreeIfy.tree.evtActiveNode(node);
                        this.orgTreeIfy.tree._locationedContinue();
                        this.orgTreeIfy.tree._locationedScroll();
                    } else {
                        const isExist =
                            this.orgTreeIfy.find.parentList.findIndex(
                                v => v.DATA_UNIT_ORG_ID === node.key
                            ) > -1;
                        if (isExist) {
                            node.isExpanded = true;
                            // 有子节点并且未取出来
                            if (!node.isLeaf && node.getChildren().length === 0) {
                                const childNodes =
                                    await this.orgTreeIfy.tree._asyncLoadNodeChildNode(node);
                                node.addChildren(childNodes);
                            }
                            if (node.getChildren().length > 0) {
                                this.orgTreeIfy.tree._selectedLocationOrg(
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
                return this.service.getTreeData(this.orgTreeIfy.group.value, node.key).toPromise();
            },
            // 滚动到定位节点位置
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.orgTreeIfy.tree.activeNode;
                    const el = <HTMLElement>node.component.dragElement.nativeElement;
                    this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
            // 定位机构树节点后执行
            _locationedContinue: () => {},
        },
    };
    @ViewChild('treeView', { static: false }) private treeViewEl: ElementRef;
    @ViewChild('treeSearchView', { static: false }) private treeSearchViewEl: ElementRef;
    /** 机构顶部tab条 */
    treeTab = {
        index: 0,
        list: [],
        current: null,
        indexChange: index => {
            this.treeTab.index = index;
            this.treeTab.current = this.treeTab.list[index];
            switch (index) {
                case 0:
                    if (!this.treeTab.current.temp) {
                        this.treeTab.list[index].temp = this.treeViewEl;
                    }
                    break;
                case 1:
                    if (!this.treeTab.current.temp) {
                        this.treeTab.list[index].temp = this.treeSearchViewEl;
                    }
                    break;
            }
        },
    };

    columnType = ColumnTypeEnum;
    /** 机构查询 */
    searchOrg = {
        form: new FormGroup({}),
        fields: [],
        zh_CN: {},
        init: () => {
            this.commonService.getSchemeContent('XZ_UnitSearch').subscribe(res => {
                const fields = {};
                res.systemSchemeList.forEach(systemScheme => {
                    systemScheme.systemSchemeEdit.forEach(field => {
                        fields[field.TABLE_COLUMN_CODE] = field.SCHEME_EDIT_IS_MUST_INPUT
                            ? new FormControl(null, Validators.required)
                            : new FormControl(null);
                            this.searchOrg.fields = [...this.searchOrg.fields, field];
                    });
                });
                this.searchOrg.form = new FormGroup(fields);
            });
        }
    };

    @ViewChild('unitMsgView', { static: false }) private unitMsgViewEl: UnitMsgViewComponent;
    @ViewChild('UnitRecoverView', { static: false })
    private UnitRecoverViewEl: UnitRecoverViewComponent;
    @ViewChild('UnitTransferView', { static: false })
    private UnitTransferViewEl: UnitTransferViewComponent;
    @ViewChild('UnitSortView', { static: false }) private UnitSortViewEl: UnitSortViewComponent;
    @ViewChild('UnitBatchTransferView', { static: false })
    private UnitBatchTransferViewEl: UnitBatchTransferViewComponent;
    @ViewChild('UnitCheckView', { static: false }) private UnitCheckViewEl: UnitCheckViewComponent;
    /** 按钮权限 */
    buttonPower = {
        power: <any>{},
        loadPower: () => {
            this.a_roter.data.subscribe((data: { tag: string }) => {
                const menus = this.commonService.getNavigeList();
                const menu = menus.find(item => item.SYSTEM_RESOURCE_GUARD_ID === data.tag);
                if (menu) {
                    menus
                        .filter(item => item.SYS_PARENT === menu.SYSTEM_RESOURCE_TREE_ID)
                        .forEach(x => {
                            this.buttonPower.power[x.SYSTEM_RESOURCE_GUARD_ID] = true;

                            // 处理二级权限
                            menus
                                .filter(item => item.SYS_PARENT === x.SYSTEM_RESOURCE_TREE_ID)
                                .forEach(x => {
                                    this.buttonPower.power[x.SYSTEM_RESOURCE_GUARD_ID] = true;
                                });
                        });
                }
            });
        },
        click: event => {
            switch (event) {
                case 'insertUnit':
                    this.unitMsgViewEl.show();
                    break;
                case 'removeUnit':
                    this.deleteOrgNode();
                    break;
                case 'recovery':
                    this.UnitRecoverViewEl.show();
                    break;
                case 'subjection':
                    this.UnitTransferViewEl.show();
                    break;
                case 'sort':
                    this.UnitSortViewEl.show();
                    break;
                case 'batchTransfer':
                    this.UnitBatchTransferViewEl.show();
                    break;
                case 'dataCheck':
                    if (!this.orgTreeIfy.tree.activeNode) {
                        this.message.warning('请先选择单位！');
                        return;
                    }
                    this.UnitCheckViewEl.show();
                    break;
            }
        },
    };

    /** 显示类型 列表或者表册 */
    showType = 0;

    /** 单位信息表 */
    unitTableIfy = {
        rows: [],
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        loadRows: (isSearch = false) => {

            // 机构查询
            if (isSearch) {
                const data = this.searchOrg.form.getRawValue();
                for (const i in data) {
                    if (data[i] === null || data[i] === '' || data[i].length === 0) {
                        delete data[i];
                    }
                }
                this.unitTableIfy.loading = true;
                this.service
                    .searchOrg(
                        data,
                        this.unitTableIfy.pageIndex,
                        this.unitTableIfy.pageSize,
                        this.orgTreeIfy.group.value
                    )
                    .subscribe(json => {
                        this.unitTableIfy.loading = false;
                        if (json.data) {
                            if (json.data.pageIndex === 1) {
                                this.unitTableIfy.total = json.data.totalCount;
                            }
                            this.unitTableIfy.rows = json.data.result;
                        }
                    });
                    return;
            }

            const param = {
                DATA_UNIT_ORG_ID: this.orgTreeIfy.tree.activeNode.key,
                ORG_TYPE: this.orgTreeIfy.tree.activeNode.origin.ORG_TYPE,
                $TREE_INCLUDE_LOWER_LEVEL$: this.orgTreeIfy.tree.isInclude,
                $QUERY_FIELDS$: 'B0101,B0111,B0114,B0131,B0124,B0127,B0117,UNIT_TYPE',
                $PAGE_INDEX$: this.unitTableIfy.pageIndex,
                $PAGE_SIZE$: this.unitTableIfy.pageSize,
            };
            this.unitTableIfy.loading = true;
            this.service.getOrgUnitTableData(param).subscribe(res => {
                this.unitTableIfy.loading = false;
                this.unitTableIfy.rows = res.result;
                if (res.pageIndex === 1) {
                    this.unitTableIfy.total = res.totalCount;
                }
            });
        },
        indexChange: index => {
            this.unitTableIfy.pageIndex = index;
            this.unitTableIfy.loadRows();
        },
        sizeChange: size => {
            this.unitTableIfy.pageSize = size;
            this.unitTableIfy.loadRows();
        },
        // 表格双击事件
        dbClick: item => {
            this.unitMsgViewEl.show(item);
        },
    };

    constructor(
        private service: UnitManageService,
        private cdr: ChangeDetectorRef,
        private clientService: ClientService,
        private a_roter: ActivatedRoute,
        private commonService: CommonService,
        private loading: LoadingService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        // 加载机构树分组数据
        this.orgTreeIfy.group.loadList();
        // 加载机构查询字段
        this.searchOrg.init();
        // 创建面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '系统功能',
            },
            {
                type: 'text',
                text: '机构管理',
            },
        ]);
        // 加载按钮权限
        this.buttonPower.loadPower();
    }

    ngAfterViewInit() {
        this.treeTab.list = [
            {
                title: '机构树',
                temp: null,
            },
            {
                title: '机构查询',
                temp: null,
            },
        ];
        this.treeTab.indexChange(0);
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载机构树信息
     */
    loadOrgTree() {
        this.service.getTreeData(this.orgTreeIfy.group.value).subscribe(result => {
            this.orgTreeIfy.tree.nodes = result; // 左边机构树
        });
    }

    /**
     * 添加机构触发
     * @param node 添加接口返回的数据
     */
    addChange(node) {
        if (node.SYS_PARENT === -1) {
            this.orgTreeIfy.tree.nodes.push(node);
            this.orgTreeIfy.tree.nodes = [...this.orgTreeIfy.tree.nodes];
        } else {
            this.orgTreeIfy.tree.activeNode.isLeaf = false;
            if (this.orgTreeIfy.tree.activeNode.isExpanded) {
                this.orgTreeIfy.tree.activeNode.addChildren([node]);
            }
        }
        this.unitTableIfy.rows = [...this.unitTableIfy.rows, node];
    }

    /**
     * 修改机构触发
     * @param node 修改后的信息
     */
    updateChange(node) {
        const index = this.unitTableIfy.rows.findIndex(
            x =>
                x[`${this.tableHelper.getTableCode('B01')}_ID`] ===
                node.data[`${this.tableHelper.getTableCode('B01')}_ID`]
        );
        this.unitTableIfy.rows[index] = node.data;
        this.unitTableIfy.rows = [...this.unitTableIfy.rows];
    }

    /**
     * 删除节点
     */
    deleteOrgNode() {
        if (!this.orgTreeIfy.tree.activeNode) {
            return this.message.warning('请先选择机构树节点！');
        }
        const param = {
            DATA_UNIT_ORG_ID: this.orgTreeIfy.tree.activeNode.origin.DATA_UNIT_ORG_ID,
        };
        const _loading = this.loading.show();
        this.service.deleteOrgUnitData(param).subscribe(res => {
            _loading.close();
            if (res.code === 0) {
                this.orgTreeIfy.tree.activeNode.remove();
                const parentNode = this.orgTreeIfy.tree.activeNode.parentNode;
                if (parentNode && parentNode.getChildren().length === 0) {
                    parentNode.isLeaf = true;
                } else {
                    if (!parentNode) {
                        this.orgTreeIfy.tree.nodes.splice(
                            this.orgTreeIfy.tree.nodes.findIndex(
                                item => item.key === this.orgTreeIfy.tree.activeNode.key
                            ),
                            1
                        );
                        this.orgTreeIfy.tree.nodes = [...this.orgTreeIfy.tree.nodes];
                    }
                }
                this.unitTableIfy.rows = [];
                this.orgTreeIfy.tree.activeNode = null;
            }
        });
    }

    /**
     * 机构回收
     */
    recoverChange(event) {
        this.loadOrgTree();
    }

    /**
     * 关系转移
     */
    transferChange() {
        this.loadOrgTree();
    }

    /**
     * 机构排序
     */
    sortChange() {
        this.loadOrgTree();
    }
}
