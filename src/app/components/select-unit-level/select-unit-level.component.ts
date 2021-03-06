import {
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
    Output,
    EventEmitter,
    ElementRef,
    Input,
} from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SelectUnitLevelService } from './select-unit-level.service';
import { NzTreeComponent, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from 'app/util/common.service';
import { AppConfig } from 'app/app.config';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'select-unit-level',
    templateUrl: './select-unit-level.component.html',
    styleUrls: ['./select-unit-level.component.scss'],
})
export class SelectUnitLevelComponent implements OnInit {
    @Input() findWidth = 220;
    @Input() defaultLoad; // 是否默认选中某单位（treeNode.origin.ORG_NAME === this.defaultLoad）
    @Output() CheckedChange = new EventEmitter<any>();

    @ViewChild('unitSelectedIfyTree', { static: true }) unitSelectedIfyTree: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    // 机构分组ID
    groupId: string;

    /**
     * 机构选择
     */
    unitSelectedIfy = {
        find: {
            width: this.findWidth,
            placeholder: '请输入关键字搜索',
            value: null,
            nzFilterOption: () => true,
            searchKey: null,
            searchList: [],
            parentList: [],
            moduleChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.unitSelectedIfy.find.parentList = result;
                    const nodes = this.unitSelectedIfyTree.getTreeNodes();
                    this.unitSelectedIfy.find.location(nodes);
                });
            },
            onSearch: key => {
                if (key) {
                    this.service.selectListByQuery(this.groupId, key.trim()).subscribe(result => {
                        this.unitSelectedIfy.find.searchList = result;
                    });
                }
            },
            location: nodes => {
                nodes.forEach(async node => {
                    if (node.key === this.unitSelectedIfy.find.value) {
                        this.unitSelectedIfy.tree.nzSelectedKeys = [node.key];
                        this.unitSelectedIfy.tree.activedNode = node;
                        this.unitSelectedIfy.find._nodePosition();
                    } else {
                        const _parent = this.unitSelectedIfy.find.parentList.find(
                            v => node.key === v.DATA_UNIT_ORG_ID
                        );
                        if (_parent) {
                            if (node && node.getChildren().length === 0) {
                                const childNodes = await this.unitSelectedIfy.tree._loadSync(node);
                                node.addChildren(childNodes);
                            }
                            this.unitSelectedIfy.tree.nzExpandedKeys = [
                                ...this.unitSelectedIfy.tree.nzExpandedKeys,
                                node.key,
                            ];
                            this.unitSelectedIfy.find.location(node.children);
                        }
                    }
                });
            },
            /**
             * 定位选中节点
             */
            _nodePosition: () => {
                setTimeout(() => {
                    const node: any = this.unitSelectedIfy.tree.activedNode;
                    const el = <HTMLElement>node.component.elementRef.nativeElement;
                    this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
        },

        /**
         * 机构树
         */
        tree: {
            nodes: [],
            icons: ['sitemap', 'server', 'building-o'],
            activedNode: <NzTreeNode>{},
            nzSelectedKeys: [],
            nzExpandedKeys: [],
            nzCheckBoxChange: (data: NzFormatEmitEvent) => {
                const { origin } = data.node;
                if (!origin.isChecked) {
                    origin.includeChild = origin.isChecked;
                    this.unitSelectedIfy.tree._setParentNodesIsincludeChild(data.node);
                }
                this.CheckedChange.emit();
            },
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.unitSelectedIfy.tree.activedNode = data.node;
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;
                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service.getOrgUnitTree(this.groupId, node.key).subscribe(nodes => {
                            const check = node.origin.includeChild;
                            node.addChildren(
                                nodes.map(n => {
                                    n.checked = check;
                                    n.includeChild = check;
                                    return n;
                                })
                            );
                        });
                    }
                }
            },
            /**
             * 加载机构树
             */
            _load: () => {
                this.service.getOrgUnitTree(this.groupId).subscribe(nodes => {
                    this.unitSelectedIfy.tree.nodes = nodes;
                    if (this.defaultLoad) {
                        setTimeout(() => {
                            const Nodes = this.unitSelectedIfyTree.getTreeNodes();
                            let node = Nodes.find(
                                item => item.origin.ORG_NAME === this.defaultLoad
                            );
                            node.isChecked = true;
                            this.CheckedChange.emit();
                        });
                    }
                });
            },
            /**
             * 加载节点信息（Promise）
             */
            _loadSync: node => {
                return this.service.getOrgUnitTree(this.groupId, node.key).toPromise();
            },

            contextMenu: ($event: MouseEvent, menu: NzDropdownMenuComponent, node: NzTreeNode) => {
                this.unitSelectedIfy.tree.activedNode = node;
                this.nzDropdownService.create($event, menu);
            },
            /**
             * 选中（取消）包含下层
             */
            evtChecklevel: (status: boolean = false) => {
                const { origin } = this.unitSelectedIfy.tree.activedNode;
                this.unitSelectedIfy.tree.activedNode.isChecked = status;
                origin.includeChild = status;
                if (!this.unitSelectedIfy.tree.activedNode.key) {
                    this.message.warning('未选中上层机构!');
                    return;
                }
                this.unitSelectedIfy.tree.activedNode.isChecked = status;
                this.unitSelectedIfy.tree._setExpandCheckChildNodes(
                    this.unitSelectedIfy.tree.activedNode,
                    status
                );
                if (!status) {
                    this.unitSelectedIfy.tree._setParentNodesIsincludeChild(
                        this.unitSelectedIfy.tree.activedNode
                    );
                }
                this.CheckedChange.emit();
            },
            /**
             * 设置所有已知子节点的选中状态
             */
            _setExpandCheckChildNodes: (node: NzTreeNode, status: boolean = false) => {
                node.children.forEach(v => {
                    v.setChecked(status);
                    v.origin.includeChild = status;
                    if (v.getChildren().length > 0) {
                        this.unitSelectedIfy.tree._setExpandCheckChildNodes(v, status);
                    }
                });
            },
            /**
             * 设置父节点的选中下层属性
             */
            _setParentNodesIsincludeChild: (node: NzTreeNode) => {
                if (node.origin.includeChild) {
                    node.origin.includeChild = false;
                }
                if (node.parentNode) {
                    this.unitSelectedIfy.tree._setParentNodesIsincludeChild(node.parentNode);
                }
            },
        },
    };
    protected appSettings = AppConfig.settings;
    constructor(
        private service: SelectUnitLevelService,
        private message: NzMessageService,
        private nzDropdownService: NzContextMenuService,
        private commonService: CommonService
    ) {}

    ngOnInit() {
        this.groupId = this.appSettings.appServer.DATA_UNIT_ORG_GROUP_ID;

        this.unitSelectedIfy.tree._load();
    }

    /**
     * 获得选中单位
     */
    getSelectedUnitList() {
        const nodes = this.unitSelectedIfyTree.getCheckedNodeList();
        const nodeLists = this.getTreeDateCheckedLevelList(nodes);
        return nodeLists;
    }

    /**
     * 设置选中状态
     * @param list ORG_ID 数组
     * @param status false 等于清空选中
     */
    setCheckincludeChild(list, status = false) {
        if (list) {
            list.forEach(v => {
                const node = this.unitSelectedIfyTree.getTreeNodeByKey(v);
                if (node) {
                    node.origin.includeChild = status;
                    node.setChecked(status);
                    this.unitSelectedIfy.tree._setExpandCheckChildNodes(node, status);
                }
            });
        }
    }

    /**
     * 获得选中下层节点
     *
     * @param {NzTreeNode[]} data 选中节点
     * @returns {NzTreeNode[]} 去重节点
     * @memberof SettingService
     */
    private getTreeDateCheckedLevelList(data: NzTreeNode[]): NzTreeNode[] {
        return data.filter(node => {
            // 未选中下层节点
            if (!node.origin.includeChild) {
                return true;
            }
            // 无父节点
            if (!node.parentNode) {
                return true;
            }
            // 所有父节点未包含下层
            return !this.getParentNodesIsincludeChild(node.parentNode);
        });
    }

    /**
     * 获得所有父节点是否存在包含下层
     *
     * @param {NzTreeNode} node 节点
     * @returns {boolean} 是否有包含下层父节点存在
     * @memberof SettingComponent
     */
    private getParentNodesIsincludeChild(node: NzTreeNode): boolean {
        if (node.origin.includeChild) {
            return true;
        } else {
            if (node.parentNode) {
                return this.getParentNodesIsincludeChild(node.parentNode);
            }
        }
    }
}
