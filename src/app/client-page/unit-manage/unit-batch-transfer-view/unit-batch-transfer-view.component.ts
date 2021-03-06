import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitManageService } from '../unit-manage.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { LoadingService } from 'app/components/loading/loading.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-batch-transfer-view',
    templateUrl: './unit-batch-transfer-view.component.html',
    styleUrls: ['./unit-batch-transfer-view.component.scss'],
})
export class UnitBatchTransferViewComponent implements OnInit {
    private _groupId: string;
    /**
     * 机构分组Id
     */
    @Input() set groupId(v) {
        if (v) {
            this._groupId = v;
            this.loadOrgTree();
        }
    }
    get groupId() {
        return this._groupId;
    }

    /**
     * 关系转移抽屉
     */
    batchTransferDra = {
        visible: false,
        title: '关系转移',
        width: 800,
        open: () => {
            if (this.groupId) {
                this.loadOrgTree();
            }
            this.batchTransferDra.visible = true;
        },
        close: () => {
            this.batchTransferDra.visible = false;
        },
        state: 0,
        form: new FormGroup({
            A2907: new FormControl(null, Validators.required),
            A2911: new FormControl(null, Validators.required),
            mode: new FormControl(['02'], Validators.required),
        }),
        save: () => {
            if (!this.leftTreeIfy.activeNode) {
                return this.message.error('请先选择需要调整人员的单位！');
            }
            if (!this.rightTreeIfy.activeNode) {
                return this.message.error('请先选择需要调往的单位！');
            }
            if (
                this.batchTransferDra.state === 1 &&
                this.selectPSNDra.selectedPsnList.length <= 0
            ) {
                return this.message.error('请选择人员！');
            }
            const form = this.batchTransferDra.form.getRawValue();
            if (!form.A2907) {
                return this.message.error('请选择转移时间');
            }
            if (!form.A2911) {
                return this.message.error('请选择转移类别');
            }
            if (!form.mode) {
                return this.message.error('请选择转移方式');
            }
            const param = {
                DATA_3001_PERSON_A01_ID: this.selectPSNDra.selectedPsnList.map(
                    x => x.DATA_3001_PERSON_A01_ID
                ),
                OUT_UNIT: this.leftTreeIfy.activeNode.origin.ORG_B01_ID,
                INTO_UNIT: this.rightTreeIfy.activeNode.origin.ORG_B01_ID,
                TIME: form.A2907,
                ISALLTRANSFER: this.batchTransferDra.state === 0,
                TRANSFER: form.A2911,
                CATEGORY: form.mode,
                OUT_GROUP_ID: this.groupId,
                INTO_GROUP_ID: this.groupId,
            };
            const _loading = this.loading.show();
            this.service.PersonBatchTransfer(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    this.message.success('人员转移成功！');
                    this.batchTransferDra.close();
                } else {
                    this.message.error(res.msg);
                }
            });
        },
    };

    /**
     * 选择人员
     */
    selectPSNDra = {
        title: '选择人员',
        width: 500,
        visible: false,
        open: () => {
            if (!this.leftTreeIfy.activeNode) {
                return this.message.warning('请先选择要转移的单位！');
            }
            this.selectPSNDra.table.loadRows();
            this.selectPSNDra.visible = true;
        },
        close: () => {
            this.selectPSNDra.visible = false;
        },
        selectedPsnList: [],
        removeItem: item => {
            const index = this.selectPSNDra.table.rows.findIndex(
                x => x.DATA_3001_PERSON_A01_ID === item.DATA_3001_PERSON_A01_ID
            );
            this.selectPSNDra.table.rows[index].checked = false;
            this.selectPSNDra.table.refreshState();
        },
        table: {
            rows: [],
            pageIndex: 1,
            pageSize: 10,
            total: 0,

            indeterminate: false,
            allChecked: false,

            checkedAll: event => {
                this.selectPSNDra.table.rows.forEach(x => (x.checked = event));
                this.selectPSNDra.table.refreshState();
            },

            refreshState: () => {
                this.selectPSNDra.table.allChecked = this.selectPSNDra.table.rows.every(
                    x => x.checked
                );
                this.selectPSNDra.table.indeterminate =
                    this.selectPSNDra.table.rows.some(x => x.checked) &&
                    !this.selectPSNDra.table.allChecked;

                this.selectPSNDra.selectedPsnList = this.selectPSNDra.table.rows.filter(
                    x => x.checked
                );
            },

            loadRows: () => {
                const { pageIndex, pageSize } = this.selectPSNDra.table;
                const { mode } = this.batchTransferDra.form.getRawValue();
                const param = {
                    DATA_UNIT_ORG_ID: this.leftTreeIfy.activeNode.key,
                    A0103: '01',
                    UNIT_TYPE: mode.length > 1 || mode.length === 0 ? '01' : mode[0],
                    $TREE_INCLUDE_LOWER_LEVEL$: false,
                    $PAGE_INDEX$: pageIndex,
                    $PAGE_SIZE$: pageSize,
                    $FILTER_CONDITION$: {},
                };
                const _loading = this.loading.show();
                this.service.selectPageByOrgId(param).subscribe(res => {
                    _loading.close();
                    if (res) {
                        if (pageIndex === 1) {
                            this.selectPSNDra.table.total = res.totalCount;
                        }
                        this.selectPSNDra.table.rows = res.result;
                    }
                });
            },
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
        private message: NzMessageService,
        private commonService: CommonService
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
        this.batchTransferDra.open();
    }
}
