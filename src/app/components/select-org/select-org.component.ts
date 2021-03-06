import { SelectOrgService } from './select-org.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { NzTreeComponent, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { CommonService } from 'app/util/common.service';
import { AppConfig } from 'app/app.config';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'select-org',
    templateUrl: './select-org.component.html',
    styleUrls: ['./select-org.component.scss'],
})
export class SelectOrgComponent implements OnInit {
    /**
     * 是否显示包含下层（单个节点包含下层）
     */
    @Input() isLevel = false;

    /**
     * 选中单位触发
     */
    @Output() selectOrgChange = new EventEmitter<any>();

    @ViewChild('orgUnitElement', { static: false }) private orgUnitElement: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;

    /**
     * 搜索订阅者
     */
    private searchKey$ = new Subject<string>();

    /**
     * 机构分组编码
     */
    orgGroupId;

    /**
     * 机构树相关
     */
    orgTreeIfy = {
        // 分组
        // group: {
        //     list: [],
        //     value: null,
        //     evtChange: () => {
        //         this.orgTreeIfy.tree.activedNode = null;
        //         this.orgTreeIfy.find.keyword = null;
        //         this.orgTreeIfy.level.yeNo = false;
        //         this.orgTreeIfy.tree._loadOrgList();
        //     },
        // },

        // 是否包含下层
        level: {
            yeNo: false,
            evtLevelChange: () => {
                this.selectOrgChange.emit({
                    level: this.orgTreeIfy.level.yeNo,
                    selectedNode: this.orgTreeIfy.tree.activedNode
                        ? this.orgTreeIfy.tree.activedNode.origin
                        : {},
                });
            },
        },

        // 机构树查找
        find: {
            list: [],
            parentList: [],
            keyword: null,
            evtOpenChange: status => {
                if (status) {
                    this.orgTreeIfy.find.keyword = null;
                }
            },
            evtOnSearch: (keyword: string) => {
                this.searchKey$.next(keyword);
            },
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.orgTreeIfy.find.parentList = result;
                    const nodes = this.orgUnitElement.getTreeNodes();
                    this.orgTreeIfy.tree._selectedLocationOrg(nodes, value);
                });
            },
        },

        // 机构树
        tree: {
            nodes: [],
            icons: ['sitemap', 'server', 'building-o'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.orgTreeIfy.tree.activedNode = data.node;

                this.selectOrgChange.emit({
                    level: this.orgTreeIfy.level.yeNo,
                    selectedNode: this.orgTreeIfy.tree.activedNode.origin,
                });
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;

                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getOrgUnitTree(this.orgGroupId, node.key)
                            .subscribe(nodes => node.addChildren(nodes));
                    }
                }
            },

            /**
             * 加载机构树
             */
            _loadOrgList: () => {
                this.service
                    .getOrgUnitTree(this.orgGroupId)
                    .subscribe(nodes => (this.orgTreeIfy.tree.nodes = nodes));
            },
            /**
             * 定位机构树节点
             */
            _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
                nodes.forEach(async node => {
                    if (loctionOrg === node.key) {
                        this.orgTreeIfy.tree.activedNode = node;
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
            /*
             * 查询子节点
             */
            _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
                return this.service.getOrgUnitTree(this.orgGroupId, node.key).toPromise();
            },
            /*
             * 滚动到定位节点位置
             */
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.orgTreeIfy.tree.activedNode;
                    const el = <HTMLElement>node.component.dragElement.nativeElement;
                    this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
            /*
             * 定位机构树节点后执行
             */
            _locationedContinue: () => {
                this.selectOrgChange.emit({
                    level: this.orgTreeIfy.level.yeNo,
                    selectedNode: this.orgTreeIfy.tree.activedNode.origin,
                });
            },
        },
    };
    protected appSettings = AppConfig.settings;

    constructor(private service: SelectOrgService, private commonService: CommonService) {}

    ngOnInit() {
        // 单位搜索
        this.searchKey$
            .pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(100),
                filter(v => !!v.trim()),

                // ignore new term if same as previous term
                distinctUntilChanged()
            )
            .subscribe(keyword => {
                this.service
                    .selectListByQuery(this.orgGroupId, keyword.trim())
                    .subscribe(result => (this.orgTreeIfy.find.list = result));
            });

        this.loadOrgGroupId();
    }

    /**
     * 加载机构
     */
    private async loadOrgGroupId() {
        this.orgGroupId = this.appSettings.appServer.DATA_UNIT_ORG_GROUP_ID;
        this.orgTreeIfy.tree._loadOrgList();
    }
}
