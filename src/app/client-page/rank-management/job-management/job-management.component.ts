import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { JobManagementService } from './job-management.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'gl-job-management',
    templateUrl: './job-management.component.html',
    styleUrls: ['./job-management.component.scss'],
})
export class JobManagementComponent implements OnInit, AfterViewInit {

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
                    this.orgTreeIfy._init();
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
            // 点击节点数触发
            evtActiveNode: (data: any) => {
                this.orgTreeIfy.tree.activeNode = data.node || data;

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
                                const childNodes = await this.orgTreeIfy.tree._asyncLoadNodeChildNode(
                                    node
                                );
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
        _init: () => {
            this.service.getTreeData(this.orgTreeIfy.group.value).subscribe(result => {
                this.orgTreeIfy.tree.nodes = result; // 左边机构树
            });
        }
    };

    @ViewChild('jobNumber') private jobNumberView: ElementRef;
    @ViewChild('overallArrangement') private overallArrangementView: ElementRef;
    @ViewChild('usage') private usageView: ElementRef;
    @ViewChild('statisticalQuery') private statisticalQueryView: ElementRef;
    /** 顶部TabBar */
    tabBarIfy = {
        list: [],
        index: 0,
        indexChange: index => {
            this.tabBarIfy.index = index;
            switch(index) {
                case 1:
                    this.tabBarIfy.list[index].temp = this.overallArrangementView;
                    break;
                case 2:
                    this.tabBarIfy.list[index].temp = this.usageView;
                    break;
                case 3:
                    this.tabBarIfy.list[index].temp = this.statisticalQueryView;
                    break;
            }
        }
    }

    constructor(
        private service: JobManagementService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.orgTreeIfy.group.loadList();
    }

    ngAfterViewInit(): void {
        this.tabBarIfy.list = [
            {
                title: '职数管理',
                temp: this.jobNumberView,
            },
            {
                title: '统筹设置'
            },
            {
                title: '使用情况',
            },
            {
                title: '统计查询'
            }
        ];
        this.cdr.detectChanges();
    }
}
