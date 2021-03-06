import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitManageService } from '../unit-manage.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { LoadingService } from 'app/components/loading/loading.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-transfer-view',
    templateUrl: './unit-transfer-view.component.html',
    styleUrls: ['./unit-transfer-view.component.scss'],
})
export class UnitTransferViewComponent implements OnInit {
    private _groupId: string;
    /**
     * 机构分组Id
     */
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
    @Output() transferChange = new EventEmitter<any>();

    /**
     * 关系转移抽屉
     */
    transferDra = {
        visible: false,
        title: '关系转移',
        width: 800,
        open: () => {
            if (this.groupId) {
                this.loadOrgTree();
            }
            this.transferDra.visible = true;
        },
        close: () => {
            this.transferDra.visible = false;
        },
        save: () => {
            if (this.leftTreeIfy.activeNode === null) {
                return this.message.warning('请选择需要调整的节点！');
            }
            if (this.rightTreeIfy.activeNode === null) {
                return this.message.warning('请选择调整之后所在节点！');
            }
            const _loading = this.loading.show();
            this.service
                .moveNode(
                    this.leftTreeIfy.activeNode.origin.DATA_UNIT_ORG_ID,
                    this.rightTreeIfy.activeNode.origin.DATA_UNIT_ORG_ID
                )
                .subscribe(res => {
                    _loading.close();
                    if (res.code === 0) {
                        this.transferChange.emit();
                        this.transferDra.close();
                    }
                });
        },
    };

    @ViewChild('orgUnitElement_left', { static: false }) private orgTree_leftEl: NzTreeComponent;
    @ViewChild('scrollViewport_left', { static: false })
    private scrollViewport_left: CdkVirtualScrollViewport;

    /**
     * 左边机构树
     */
    leftTreeIfy = {
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
                        .subscribe(result => (this.leftTreeIfy.find.list = result));
                }
            },
            // 选中的optiong改变回调
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.leftTreeIfy.find.parentList = result;
                    const nodes = this.orgTree_leftEl.getTreeNodes();
                    this.leftTreeIfy._selectedLocationOrg(nodes, value);
                });
            },
        },
        nodes: [],
        nodeIcon: ['sitemap', 'server', 'building-o'],
        activeNode: <NzTreeNode>null,
        // 点击节点数触发
        evtActiveNode: (data: any) => {
            this.leftTreeIfy.activeNode = data.node || data;
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
                    this.leftTreeIfy.evtActiveNode(node);
                    this.leftTreeIfy._locationedContinue();
                    this.leftTreeIfy._locationedScroll();
                } else {
                    const isExist =
                        this.leftTreeIfy.find.parentList.findIndex(
                            v => v.DATA_UNIT_ORG_ID === node.key
                        ) > -1;
                    if (isExist) {
                        node.isExpanded = true;
                        // 有子节点并且未取出来
                        if (!node.isLeaf && node.getChildren().length === 0) {
                            const childNodes = await this.leftTreeIfy._asyncLoadNodeChildNode(node);
                            node.addChildren(childNodes);
                        }
                        if (node.getChildren().length > 0) {
                            this.leftTreeIfy._selectedLocationOrg(node.children, loctionOrg);
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
                const node: any = this.leftTreeIfy.activeNode;
                const el = <HTMLElement>node.component.dragElement.nativeElement;
                this.scrollViewport_left.scrollToOffset(el.offsetTop - 30);
            }, 100);
        },
        // 定位机构树节点后执行
        _locationedContinue: () => {},
    };

    @ViewChild('orgUnitElement_right', { static: false }) private orgTree_rightEl: NzTreeComponent;
    @ViewChild('scrollViewport_right', { static: false })
    private scrollViewport_right: CdkVirtualScrollViewport;
    /**
     * 右边机构树
     */
    rightTreeIfy = {
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
                        .subscribe(result => (this.rightTreeIfy.find.list = result));
                }
            },
            // 选中的optiong改变回调
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.rightTreeIfy.find.parentList = result;
                    const nodes = this.orgTree_rightEl.getTreeNodes();
                    this.rightTreeIfy._selectedLocationOrg(nodes, value);
                });
            },
        },
        nodes: [],
        nodeIcon: ['sitemap', 'server', 'building-o'],
        activeNode: <NzTreeNode>null,
        // 点击节点数触发
        evtActiveNode: (data: any) => {
            this.rightTreeIfy.activeNode = data.node || data;
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
                    this.rightTreeIfy.evtActiveNode(node);
                    this.rightTreeIfy._locationedContinue();
                    this.rightTreeIfy._locationedScroll();
                } else {
                    const isExist =
                        this.rightTreeIfy.find.parentList.findIndex(
                            v => v.DATA_UNIT_ORG_ID === node.key
                        ) > -1;
                    if (isExist) {
                        node.isExpanded = true;
                        // 有子节点并且未取出来
                        if (!node.isLeaf && node.getChildren().length === 0) {
                            const childNodes = await this.rightTreeIfy._asyncLoadNodeChildNode(
                                node
                            );
                            node.addChildren(childNodes);
                        }
                        if (node.getChildren().length > 0) {
                            this.rightTreeIfy._selectedLocationOrg(node.children, loctionOrg);
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
                const node: any = this.rightTreeIfy.activeNode;
                const el = <HTMLElement>node.component.dragElement.nativeElement;
                this.scrollViewport_right.scrollToOffset(el.offsetTop - 30);
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
            this.leftTreeIfy.nodes = result; // 左边机构树
            this.rightTreeIfy.nodes = result; // 右边边机构树
        });
    }

    public show() {
        this.transferDra.open();
    }
}
