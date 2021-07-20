import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitManageService } from '../unit-manage.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-check-view',
    templateUrl: './unit-check-view.component.html',
    styleUrls: ['./unit-check-view.component.scss'],
})
export class UnitCheckViewComponent implements OnInit, AfterViewInit {
    /**
     * 分组Id
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
     * 当前选中单位节点
     */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
        }
    }
    get node() {
        return this._node;
    }

    /**
     * 是否包含在职库
     */
    isInclude: boolean;
    /**
     * 机构校验抽屉
     */
    checkDra = {
        visible: false,
        title: '机构校验',
        width: 800,
        open: () => {
            this.formulaTbl.loadRows();
            this.checkDra.visible = true;
        },
        close: () => {
            this.checkDra.visible = false;
        },
        startCheck: () => {
            this.tabIfy.evtChange(1);
            this.resultTbl.loadRows();
        },
    };

    /**
     * 校验公式表格
     */
    formulaTbl = {
        rows: [],
        pageIndex: 1,
        pageSize: 7,
        loading: false,

        loadRows: () => {
            const param = {
                checkType: 2,
            };
            this.formulaTbl.loading = true;
            this.service.getDataCheckTable(param).subscribe(res => {
                this.formulaTbl.loading = false;
                if (res.code === 0) {
                    this.formulaTbl.rows = [...res.data];
                }
            });
        },
    };

    /**
     * 校验结果变革
     */
    resultTbl = {
        rows: [],
        pageIndex: 1,
        pageSize: 7,
        loading: false,

        loadRows: () => {
            const data = {
                orgId: this.node.origin.DATA_UNIT_ORG_ID,
                unitId: this.node.origin.ORG_B01_ID,
                checkType: 2,
                treeIncludeLowerLevel: this.isInclude,
            };
            this.resultTbl.loading = true;
            this.service.checkExecute(data).subscribe(res => {
                this.resultTbl.loading = false;
                if (res.code === 0) {
                    // 只操作第一页数据
                    const pageData = res.data.slice(0, this.resultTbl.pageSize + 1);
                    if (pageData.length > 0) {
                        this.rowSpanPageData(pageData);
                        this.resultTbl.rows = [...pageData];
                    }
                }
            });
        },
    };
    /**
     * 切换单位抽屉
     */
    switchUnitDra = {
        visible: false,
        title: '机构校验',
        width: 400,
        open: () => {
            this.loadOrgTree();
            this.switchUnitDra.visible = true;
        },
        close: () => {
            this.switchUnitDra.visible = false;
        },
        enter: () => {
            this.node = this.treeIfy.activeNode;
            this.switchUnitDra.close();
        },
    };

    @ViewChild('orgUnitElement', { static: false }) private orgTreeEl: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;
    /**
     * 机构树
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

    @ViewChild('checkFormula', { static: false }) private checkFormulaEl: ElementRef;
    @ViewChild('checkResults', { static: false }) private checkResultsEl: ElementRef;
    /**
     * tab条
     */
    tabIfy = {
        list: [],
        index: 0,
        evtChange: index => {
            this.tabIfy.index = index;
            switch (index) {
                case 0:
                    if (!this.tabIfy.list[index].temp) {
                        this.tabIfy.list[index].temp = this.checkFormulaEl;
                    }
                    break;
                case 1:
                    if (!this.tabIfy.list[index].temp) {
                        this.tabIfy.list[index].temp = this.checkResultsEl;
                    }
                    break;
            }
        },
    };

    constructor(
        private service: UnitManageService,
        private loading: LoadingService,
        private message: NzMessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.tabIfy.list = [
            {
                title: '校验公式',
            },
            {
                title: '校验结果',
            },
        ];
        this.tabIfy.evtChange(0);
        this.cdr.detectChanges();
    }

    isIncludeChange() {
        this.checkDra.startCheck();
    }

    /**
     * 加载机构树信息
     */
    loadOrgTree() {
        this.service.getTreeData(this.groupId).subscribe(result => {
            this.treeIfy.nodes = result;
        });
    }

    show() {
        this.checkDra.open();
    }
    /**
     * 处理表格行合并
     */
    rowSpanPageData(pageData) {
        let rowSpan = 1;
        let rowIndex = 0;
        let lastKeyId = pageData[0].keyId;
        pageData.forEach((row, index) => {
            if (rowIndex !== index && lastKeyId === row.keyId) {
                pageData[index].isHide = true;
                rowSpan++;
                if (
                    rowIndex !== index &&
                    lastKeyId === row.keyId &&
                    index === pageData.length - 1
                ) {
                    pageData[rowIndex].rowSpan = rowSpan;
                    rowSpan = 1;
                    rowIndex = index;
                    lastKeyId = row.keyId;
                }
            } else {
                pageData[index].isHide = false;
                pageData[rowIndex].rowSpan = rowSpan;
                rowSpan = 1;
                rowIndex = index;
                lastKeyId = row.keyId;
            }
        });
    }
}
