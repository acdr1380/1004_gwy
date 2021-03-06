import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    TemplateRef,
    OnDestroy,
} from '@angular/core';
import { NzTreeNode, NzFormatEmitEvent, NzTreeComponent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzContextMenuService } from 'ng-zorro-antd/dropdown';

import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Router, ActivatedRoute } from '@angular/router';
import { Base64 } from 'js-base64';
import { Subject } from 'rxjs';
import { Highcharts } from 'app/util/chart/highcharts';

import { JournalQueryService } from './journal-query.service';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
    selector: 'gl-journal-query',
    templateUrl: './journal-query.component.html',
    styleUrls: ['./journal-query.component.scss'],
})
export class JournalQueryComponent implements OnInit {
    @ViewChild('unitTreeElement', { static: false }) private _unitTreeElement: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private _scrollViewport: CdkVirtualScrollViewport;
    @ViewChild('unitSelectorifyTree', { static: false }) _unitSelectorifyTree: NzTreeComponent;
    @ViewChild('monthInfo', { static: false }) _monthInfo: ElementRef;
    @ViewChild('yearInfo', { static: false }) _yearInfo: ElementRef;
    @ViewChild('yearChart', { static: false }) _yearChart: ElementRef;
    constructor(
        private service: JournalQueryService,
        private NzContextMenuService: NzContextMenuService,
        private message: NzMessageService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private clientService: ClientService,
        private commonService: CommonService
    ) {}
    statisticsSpecificChart: Highcharts.Chart;

    unitSelectorify = <any>{
        parentContent: '',
        nodes: [],
        nodeIcon: ['sitemap', 'server', 'building-o'],
        activedNode: <NzTreeNode>{},
        nzSelectedKeys: [],
        nzExpandedKeys: [],
        evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
            if (event.eventName === 'expand') {
                const node = event.node;
                if (node && node.getChildren().length === 0 && node.isExpanded) {
                    this.service
                        .getOrgUnitTree(this.unitSelectorify.parentContent.ORG_GROUP_ID, node.key)
                        .subscribe(result => {
                            // const _check = this.getParentNodesIsincludeChild(node);
                            const _check = node.origin.includeChild;
                            node.addChildren(
                                result.map(_node => {
                                    _node.checked = _check;
                                    _node.includeChild = _check;
                                    return _node;
                                })
                            );
                        });
                }
            }
            this.unitSelectorify.dropdownClose();
        },
        nzCheckBoxChange: (data: NzFormatEmitEvent) => {
            const { origin } = data.node;
            if (!origin.checked) {
                origin.includeChild = origin.checked;
                this.setParentNodesIsincludeChild(data.node);
            }
            this.unitSelectorify.dropdownClose();
            this.dateSwitchOp.init();
        },
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.unitSelectorify.activedNode = data.node;
            this.unitSelectorify.dropdownClose();
        },
        dropdown: <NzDropdownMenuComponent>null,
        // ????????????
        contextMenu: ($event: MouseEvent, template: NzDropdownMenuComponent, node: NzTreeNode) => {
            this.unitSelectorify.activedNode = node;
            this.unitSelectorify.dropdown = this.NzContextMenuService.create($event, template);
        },
        dropdownClose: () => {
            if (this.unitSelectorify.dropdown) {
                this.unitSelectorify.dropdown.close();
            }
        },
        // ???????????????????????????
        evtCheckChange: (status: boolean = false) => {
            const { origin } = this.unitSelectorify.activedNode;
            if (!this.unitSelectorify.activedNode.key) {
                this.message.warning('?????????????????????!');
                return;
            }
            this.unitSelectorify.activedNode.isChecked = status;
            origin.includeChild = status;
            this.setExpandCheckChildNodes(this.unitSelectorify.activedNode, status);
            if (!status) {
                this.setParentNodesIsincludeChild(this.unitSelectorify.activedNode);
            }
            this.unitSelectorify.dropdownClose();
            this.dateSwitchOp.init();
        },
        // ????????????
        find: {
            width: 250,
            placeholder: '??????????????????????????????',
            valueKey: null,
            nzFilterOption: () => true,
            searchKey$: new Subject<string>(),
            searchList: [],
            parentList: [],
            moduleChange: value => {
                this.service
                    .selectAllParentsByChild({ DATA_UNIT_ORG_ID: value })
                    .subscribe(result => {
                        if (result) {
                            this.unitSelectorify.find.parentList = result;
                            const nodes = this._unitTreeElement.getTreeNodes();
                            this.unitSelectorify.find.location(nodes, value);
                        }
                    });
            },
            onSearch: key => {
                this.unitSelectorify.find.searchKey$.next(key);
            },
            location: (nodes, event) => {
                nodes.forEach(async node => {
                    if (event === node.key) {
                        this.unitSelectorify.nzSelectedKeys = [node.key];
                        this.unitSelectorify.activedNode = node;
                        this.selectorTreeNodeScrollPosition();
                    } else {
                        const _parent = this.unitSelectorify.find.parentList.find(
                            v => v.DATA_UNIT_ORG_ID === node.key
                        );
                        if (_parent) {
                            if (node && node.getChildren().length === 0) {
                                const childNodes = await this.asyncLoadNodeChildNode(node.key);
                                const _check = node.origin.includeChild;
                                node.addChildren(
                                    childNodes.map(_node => {
                                        _node.checked = _check;
                                        _node.includeChild = _check;
                                        return _node;
                                    })
                                );
                            }
                            this.unitSelectorify.nzExpandedKeys = [
                                ...this.unitSelectorify.nzExpandedKeys,
                                node.key,
                            ];
                            this.unitSelectorify.find.location(node.children, event);
                        }
                    }
                });
            },
            onFocus: () => {},
        },
    };
    pageParams = {
        pageName: '',
        type: '',
    }; // ??????????????????
    dateNow = new Date();
    orgList = [];
    dateSwitchOp = <any>{
        params: null,
        disabledDate: (current: Date): boolean => {
            // Can not select days before today and today
            return current.getFullYear() - this.dateNow.getFullYear() > 0;
        },
        dateMode: 'month', // ?????????????????????:month,year
        outletTemp: null,
        selDate: this.dateNow,
        monthGroup: new Array(12),
        allMonthData: {},
        allYearData: [],
        dateModeChange: () => {
            const that = this.dateSwitchOp;
            that.init();
        },
        init: () => {
            this.cdr.detectChanges(); // ???????????????,????????????
            this.loadStatisticData();
        },
        viewOperList: operData => {
            const params = {
                NAME: operData.NAME,
                ID: operData.ID,
                YEAR: this.dateSwitchOp.selDate.getFullYear(),
                MONTH: operData.MONTH,
                TYPE: this.pageParams.type,
                OrgList: this.orgList,
                TABLEID: operData.TABLEID || '',
                redirect: '',
            };
            this.dateSwitchOp.params = params;
            params.redirect = this.router.url;
            // this.isHide = !this.isHide;
            this.router.navigate(['oper-list'], {
                relativeTo: this.activatedRoute.parent,
                queryParams: {
                    details: Base64.encode(JSON.stringify(params)),
                },
            });
        },
        hideChange: event => {
            this.isHide = !event;
        },
    };
    sessionUser: any;
    isHide = false;
    ngOnInit() {
        const sessionUser = this.commonService.getUserLoginInfo();
        this.sessionUser = sessionUser;
        /**
         * ?????????????????????
         */
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '????????????',
            },
            {
                type: 'text',
                text: '????????????',
            },
        ]);
        this.unitSelectorify.find.searchKey$
            .pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(100),
                filter(value => !!value),

                // ignore new term if same as previous term
                distinctUntilChanged()
            )
            .subscribe(searchText => {
                this.service
                    .selectByAuthSearchValue({
                        ORG_GROUP_ID: this.unitSelectorify.parentContent.ORG_GROUP_ID,
                        ORG_NAME: searchText.trim(),
                    })
                    .subscribe(result => (this.unitSelectorify.find.searchList = result));
            });
        this.loadOrgTree();
    }
    ngOnDestroy() {
        /**
         * ???????????????????????????
         */
        this.clientService.clearBreadCrumb();
    }
    /**
     * ???????????????
     */
    loadOrgTree() {
        this.service.getOrgUnitTree(this.sessionUser.unitId).subscribe(data => {
            this.unitSelectorify.nodes = data;
            this.unitSelectorify.parentContent = data[0];
        });
    }
    /**
     * ??????????????????????????????????????????
     *
     * @private
     * @param {NzTreeNode} node ??????
     * @param {boolean} status ????????????
     * @memberof SettingComponent
     */
    private setExpandCheckChildNodes(node: NzTreeNode, status: boolean = false): void {
        node.children.forEach(v => {
            v.isChecked = status;
            v.origin.includeChild = status;
            if (v.getChildren().length > 0) {
                this.setExpandCheckChildNodes(v, status);
            }
        });
    }
    /**
     * ????????????????????????????????????
     *
     */
    private setParentNodesIsincludeChild(node: NzTreeNode): void {
        if (node.origin.includeChild) {
            node.origin.includeChild = false;
        }
        if (node.parentNode) {
            this.setParentNodesIsincludeChild(node.parentNode);
        }
    }
    /**
     * ????????????
     */
    selectorTreeNodeScrollPosition() {
        setTimeout(() => {
            let _node: any;
            [_node] = this._unitTreeElement.getSelectedNodeList();
            const el = <HTMLElement>_node.component.dragElement.nativeElement;
            this._scrollViewport.scrollToOffset(el.offsetTop);
        }, 300);
    }
    asyncLoadNodeChildNode(key) {
        return this.service
            .getOrgUnitTree(this.unitSelectorify.parentContent.ORG_GROUP_ID, key)
            .toPromise();
    }
    /**
     * ??????????????????
     */
    private loadStatisticData() {
        const nodes = this._unitSelectorifyTree.getCheckedNodeList();
        const dataList = this.getTreeDateCheckedLevelList(nodes);
        const year = this.dateSwitchOp.selDate.getFullYear();
        this.orgList = dataList.map(
            v =>
                <any>{
                    orgName: v.title,
                    orgId: v.key,
                    includeChild: !!v.origin.includeChild,
                }
        );
        const data = {
            selectOrgParamList: this.orgList,
            year: year,
        };
        if (this.dateSwitchOp.dateMode === 'month') {
            this.service.getStatisticByMonth(data).subscribe(result => {
                if (result) {
                    this.dateSwitchOp.allMonthData = result;
                }
            });
        } else if (this.dateSwitchOp.dateMode === 'year') {
            this.service.getStatisticByYear(data).subscribe(result => {
                if (result) {
                    this.dateSwitchOp.allYearData = result;
                }
                this.loadYearChart();
            });
        }
    }
    /**
     * ????????????????????????
     *
     * @param {NzTreeNode[]} data ????????????
     * @returns {NzTreeNode[]} ????????????
     * @memberof SettingService
     */
    getTreeDateCheckedLevelList(data: NzTreeNode[]): NzTreeNode[] {
        return data.filter(node => {
            // ?????????????????????
            if (!node.origin.includeChild) {
                return true;
            }
            // ????????????
            if (!node.parentNode) {
                return true;
            }
            // ??????????????????????????????
            return !this.getParentNodesIsincludeChild(node.parentNode);
        });
    }

    /**
     * ?????????????????????????????????????????????
     *
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

    //#region ???????????????
    private loadYearChart() {
        const allYearData = this.dateSwitchOp.allYearData;
        const categories = allYearData.map(v => {
            return v.WF_NAME;
        });
        const seriesData = allYearData.map(v => {
            return v.SL;
        });
        this.statisticsSpecificChart = Highcharts.chart(this._yearChart.nativeElement, <any>{
            credits: {
                // ?????????????????????????????????
                enabled: false,
            },
            exporting: {
                // ????????????????????????
                enabled: true,
            },
            chart: {
                type: 'column',
            },
            title: {
                text: allYearData.length === 0 ? '????????????' : '',
            },
            subtitle: {
                text: '',
            },
            xAxis: {
                categories: categories,
                crosshair: true,
            },
            yAxis: {
                min: 0,
                title: {
                    text: '??????(???)',
                },
            },
            tooltip: {
                // head + ?????? point + footer ?????????????????? table
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="padding:0"><b>??????: {point.y} ???</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                },
            },
            series: [
                {
                    name: '',
                    data: seriesData,
                    cursor: 'pointer',
                },
            ],
        });
    }
}
