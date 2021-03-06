import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitManageService } from '../unit-manage.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-sort-view',
    templateUrl: './unit-sort-view.component.html',
    styleUrls: ['./unit-sort-view.component.scss'],
})
export class UnitSortViewComponent implements OnInit {
    /**
     * 机构分组Id
     */
    private _groupId: string;
    @Input() set groupId(v) {
        if (v) {
            this._groupId = v;
        }
    }
    get groupId() {
        return this._groupId;
    }

    /**
     * 转移回调
     */
    @Output() sortChange = new EventEmitter<any>();

    /**
     * 机构移动抽屉
     */
    sortDra = {
        visible: false,
        title: '机构移动',
        width: 400,
        open: () => {
            if (this.groupId) {
                this.loadOrgTree();
            }
            this.sortDra.visible = true;
        },
        close: () => {
            this.sortDra.visible = false;
        },
        evtMove: (direction: number) => {
            let nodeList = [];
            if (!this.treeIfy.activeNode) {
                this.message.info('请先选择要移动的节点！');
                return;
            }
            if (this.treeIfy.activeNode.parentNode) {
                nodeList = this.treeIfy.activeNode.parentNode.getChildren();
            } else {
                this.message.info('顶层无法移动。');
                return;
            }

            const index = nodeList.findIndex(v => v.key === this.treeIfy.activeNode.key);
            if (direction === 1 && index === nodeList.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (direction === 0 && index === 0) {
                this.message.info('已经在最顶部了。');
                return;
            }
            const _loading = this.loading.show();
            this.service
                .moveAdjustSort(direction, this.treeIfy.activeNode.key)
                .subscribe(_ => {
                    _loading.close();
                    nodeList.splice(index, 1);
                    nodeList.splice(
                        index + (direction === 0 ? -1 : 1),
                        0,
                        this.treeIfy.activeNode
                    );
                    this.sortChange.emit();
                    this.treeIfy.activeNode.getParentNode().clearChildren();
                    this.treeIfy.activeNode.getParentNode().addChildren([...nodeList]);
                });
        },
    };

    @ViewChild('orgUnitElement', { static: false }) private orgTreeEl: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;
    /**
     * 左边机构树
     */
    treeIfy = {
        // 搜索
        find: {
            value: null,
            list: [],
            parentList: [],
            searchKey$: new Subject<string>(),
            evtOnSearch: (value: string) => {
                if (value) {
                    this.service
                        .selectListByQuery(this.groupId, value.trim())
                        .subscribe(result => (this.treeIfy.find.list = result));
                }
            },
            // 选中的optiong改变回调
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.treeIfy.find.parentList = result;
                    const nodes = this.orgTreeEl.getTreeNodes();
                    this.treeIfy._selectedLocationOrg(nodes, value);
                });
            },
        },
        nodes: [],
        nodeIcon: ['sitemap', 'server', 'building-o'],
        activeNode: <NzTreeNode>null,
        // 点击节点数触发
        evtActiveNode: (data: any) => {
            this.treeIfy.activeNode = data.node || data;
        },
        // 点击展开树节点图标触发
        evtChangeNode: (event: NzFormatEmitEvent) => {
            if (event.eventName === 'expand') {
                const node = event.node;
                if (node && node.getChildren().length === 0 && node.isExpanded) {
                    this.service
                        .getTreeData(this.groupId, node.key)
                        .subscribe(nodes => node.addChildren(nodes));
                }
            }
        },
        // 定位机构树节点
        _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
            nodes.forEach(async node => {
                if (loctionOrg === node.key) {
                    this.treeIfy.evtActiveNode(node);
                    this.treeIfy._locationedContinue();
                    this.treeIfy._locationedScroll();
                } else {
                    const isExist =
                        this.treeIfy.find.parentList.findIndex(
                            v => v.DATA_UNIT_ORG_ID === node.key
                        ) > -1;
                    if (isExist) {
                        node.isExpanded = true;
                        // 有子节点并且未取出来
                        if (!node.isLeaf && node.getChildren().length === 0) {
                            const childNodes = await this.treeIfy._asyncLoadNodeChildNode(node);
                            node.addChildren(childNodes);
                        }
                        if (node.getChildren().length > 0) {
                            this.treeIfy._selectedLocationOrg(node.children, loctionOrg);
                        }
                    }
                }
            });
        },
        // 查询子节点
        _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
            return this.service.getTreeData(this.groupId, node.key).toPromise();
        },
        // 滚动到定位节点位置
        _locationedScroll: () => {
            setTimeout(() => {
                const node: any = this.treeIfy.activeNode;
                const el = <HTMLElement>node.component.dragElement.nativeElement;
                this.scrollViewport.scrollToOffset(el.offsetTop - 30);
            }, 100);
        },
        // 定位机构树节点后执行
        _locationedContinue: () => {},
    };

    constructor(
        private service: UnitManageService,
        private loading: LoadingService,
        private message: NzMessageService
    ) {}

    ngOnInit() {}

    /**
     * 加载机构树信息
     */
    loadOrgTree() {
        this.service.getTreeData(this.groupId).subscribe(result => {
            this.treeIfy.nodes = result;
        });
    }

    show() {
        this.sortDra.open();
    }
}
