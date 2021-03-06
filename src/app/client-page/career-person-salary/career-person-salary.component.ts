import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectOrgDrawerComponent } from 'app/components/select-org/select-org-drawer/select-org-drawer.component';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { WorkbenchService } from 'app/workflow/workbench/workbench.service';
import { Base64 } from 'js-base64';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CareerPersonSalaryService } from './career-person-salary.service';
import { PersonOrderComponent } from './person-order/person-order.component';

@Component({
    selector: 'gl-career-person-salary',
    templateUrl: './career-person-salary.component.html',
    styleUrls: ['./career-person-salary.component.scss'],
})
export class CareerPersonSalaryComponent implements OnInit {
    orgTypeEnum = OrgTypeEnum;
    /**
     * 当前账号信息
     */
    sessionUser = this.commonService.getUserLoginInfo();

    /**
     * 选中单位
     */
    selectUnitIfy = {
        level: false,
        selectedNode: <any>{},
        evtLevelChange: () => {},
    };

    /**
     * 业务按钮
     */
    operBtnListIfy = {
        data: [],
        list: [],
        moreList: [],
        evtloadOperPage: async item => {
            if (item.disabled) {
                return false;
            }
            if (item.SYSTEM_RESOURCE_WF_ID) {
                // 判断是否存在草稿
                this.operPendingIfy.data = await this.workbenchService
                    .selectByWfId(item.SYSTEM_RESOURCE_WF_ID)
                    .toPromise();
                if (this.operPendingIfy.data.length > 0) {
                    this.operPendingIfy.title = item.SYSTEM_RESOURCE_NAME;
                    this.operPendingIfy.operBtnInfo = item;
                    this.operPendingIfy.open();
                    return;
                }
                this.operNeedAgentIfy.loadNeedAgentList(item);
            }
        },
        /**
         * 跳转业务界面
         */
        _redirectOperPage: (wfId, params: any = {}) => {
            const url = `client/workflow/factory/${wfId}/${params.stepId || ''}`;
            params.redirect = this.router.url;
            if (!params.hasOwnProperty('jobStepState')) {
                params.jobStepState = JobStepStateEnum.PROCESSING;
            }
            const GL = Base64.encode(JSON.stringify(params));
            this.router.navigate([url], { queryParams: { GL } });
        },
    };
    /**
     * 可继续办理业务
     */
    operPendingIfy = {
        // 抽屉内容
        width: 560,
        visible: false,
        title: '可继续办理业务',
        close: () => {
            this.operPendingIfy.visible = false;
        },
        open: () => {
            this.operPendingIfy.visible = true;
        },

        data: [],
        operProcess: row => {
            const url = `client/workflow/factory/${row.wfId}/${row.stepId || ''}`;
            const params = <any>{
                ...row,
                redirect: this.router.url,
            };
            if (!params.hasOwnProperty('jobStepState')) {
                params.jobStepState = JobStepStateEnum.PROCESSING;
            }

            const GL = Base64.encode(JSON.stringify(params));
            this.router.navigate([url], { queryParams: { GL } });
        },
        loading: false,
        operBtnInfo: null,
        newOperStart: () => {
            this.operNeedAgentIfy.loadNeedAgentList(this.operPendingIfy.operBtnInfo);
        },
    };

    /**
     * 代管代为抽屉
     */
    operNeedAgentIfy = {
        // 抽屉内容
        width: 480,
        visible: false,
        title: '选择代管单位发起业务',
        close: () => {
            this.operNeedAgentIfy.visible = false;
        },
        open: () => {
            this.operNeedAgentIfy._init();
            this.operNeedAgentIfy.visible = true;
        },

        wfId: null,
        table: {
            data: [],
            pageSize: 15,
            selectedRow: null,
            evtSelectRow: row => {
                this.operNeedAgentIfy.table.selectedRow = row;
            },
        },

        _init: () => {
            this.operNeedAgentIfy.table.selectedRow = null;
            if (this.operNeedAgentIfy.table.data.length > 0) {
                return;
            }
            this.workbenchService.getAgentOrgList(this.sessionUser.userId).subscribe(result => {
                this.operNeedAgentIfy.table.data = result || [];
            });
        },
        loadNeedAgentList: async item => {
            this.operPendingIfy.loading = true;
            // 业务是否代管办理
            const result = await this.workbenchService
                .getWfMainData(item.SYSTEM_RESOURCE_WF_ID)
                .toPromise();
            this.operPendingIfy.loading = false;
            if (result.isNeedAgent) {
                this.operNeedAgentIfy.wfId = item.SYSTEM_RESOURCE_WF_ID;
                this.operNeedAgentIfy.open();
                return;
            }
            this.operBtnListIfy._redirectOperPage(item.SYSTEM_RESOURCE_WF_ID);
        },
        /**
         * 选中代管单位发业务
         */
        evtSelectUnit: () => {
            const row = this.operNeedAgentIfy.table.selectedRow;
            const params = { agentOrgId: row.UNIT_ID, agentOrgName: row.UNIT_NAME };
            this.operBtnListIfy._redirectOperPage(this.operNeedAgentIfy.wfId, params);
        },
    };

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;
    @ViewChild('operListElement', { static: false }) operListElement: ElementRef;

    @ViewChild('selectOrgDrawerElement', { static: false })
    selectOrgDrawerElement: SelectOrgDrawerComponent;
    @ViewChild('personOrderElement', { static: false })
    personOrderElement: PersonOrderComponent;

    /**
     * 头部功能
     */
    headhandleIfy = {
        evtQuery: () => {
            this.router.navigate(['client/advanced-search']);
        },
        evtSelectUnit: () => {
            this.selectOrgDrawerElement.show();
        },
        evtChange: () => {
            this.personSalaryTableIfy.evtPageChange();
        },

        orderParams: null,
        evtPersonOrder: () => {
            if (!this.selectUnitIfy.selectedNode.ORG_B01_ID) {
                return;
            }
            this.headhandleIfy.orderParams = {
                // ORG_B01_ID: this.selectUnitIfy.selectedNode.ORG_B01_ID,
                // A0103: this.pClassTabIfy.value,
                // ORG_TYPE: OrgTypeEnum.UNIT,
                // UNIT_TYPE: '03',
                ...this.getCommonHttpParams(),
            };
            this.personOrderElement.show();
        },

        evtDataVerify: () => {
            // this.personVerifyElement.show();
        },
        evtDown: () => {
            let personArr = [];
            personArr = this.personSalaryTableIfy.result
                .filter(item => {
                    return this.personSalaryTableIfy.mapOfCheckedId[
                        item[`${this.tableHelper.getTableCode('A01')}_ID`]
                    ];
                })
                .map(item => item[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const data = {
                ...this.getCommonHttpParams(),
                DATA_PERSON_A01_ID_LIST: personArr,
            };
            this.service.outputExcelByOrgId(data);
        },
    };

    /**
     * 人员库
     */
    pClassTabIfy = {
        value: null,
        nzType: 'line',
        selectedIndex: 0,
        data: [],
        onSelectChange: () => {
            this.pClassTabIfy.value = this.pClassTabIfy.data[this.pClassTabIfy.selectedIndex].A0103;
            this.personSalaryTableIfy.evtPageChange(true);
        },
    };

    /**
     * 搜索订阅者
     */
    private searchKey$ = new Subject<string>();

    /**
     * 人员表格查询
     */
    personTableQueryIfy = {
        list: [],
        keyword: null,
        _reset: () => {
            this.personTableQueryIfy.keyword = null;
            this.personTableQueryIfy.list = [];
        },
        evtOpenChange: status => {
            if (status) {
                this.personTableQueryIfy.keyword = null;
            }
        },
        evtOnSearch: (keyword: string) => {
            if (keyword.trim()) {
                this.searchKey$.next(keyword.trim());
            }
        },
        evtChange: value => {
            if (value === null) {
                return;
            }
            const data = { ...this.getCommonHttpParams() };
            data[`${this.tableHelper.getTableCode('A01')}_ID`] = value;
            this.service.queryPersonRowNumber(data).subscribe(num => {
                const table = this.personSalaryTableIfy;
                table.pageIndex =
                    // tslint:disable-next-line:radix
                    parseInt(num / table.pageSize + '') + 1;
                table.selectedRowIndex = num % table.pageSize;
                table.evtPageChange(false, true);
            });
        },
    };

    // 人员表格
    @ViewChild('personSalaryTableElement', { static: false })
    personSalaryTableElement: NzTableComponent;
    /**
     * 人员工资信息表格
     */
    personSalaryTableIfy = {
        result: [],
        fields: [],
        leftColumn: ['A0101'],
        pageIndex: 1,
        pageSize: 30,
        totalCount: 0,
        BufferPx: 500,
        scroll: { x: '1500px', y: '500px' },
        loading: false,

        isCheckAll: false,
        isIndeterminate: false,
        evtCheckAll: (value: boolean) => {
            this.personSalaryTableIfy.result.forEach(
                item =>
                    (this.personSalaryTableIfy.mapOfCheckedId[
                        item[`${this.tableHelper.getTableCode('A01')}_ID`]
                    ] = value)
            );
            this.personSalaryTableIfy.evtRowCheckedChange();
        },

        mapOfCheckedId: <any>{},
        evtRowCheckedChange: () => {
            this.personSalaryTableIfy.isCheckAll =
                this.personSalaryTableIfy.result.every(
                    item =>
                        this.personSalaryTableIfy.mapOfCheckedId[
                            item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ]
                ) && this.personSalaryTableIfy.result.length > 0;
            this.personSalaryTableIfy.isIndeterminate =
                this.personSalaryTableIfy.result.some(
                    item =>
                        this.personSalaryTableIfy.mapOfCheckedId[
                            item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ]
                ) && !this.personSalaryTableIfy.isCheckAll;
        },

        selectedRowIndex: -1,
        evtSelectorRow: index => {
            this.personSalaryTableIfy.selectedRowIndex = index;
        },
        evtViewDetails: data => {
            const params = {
                // DATA_PERSON_A01_ID: data.DATA_PERSON_A01_ID,
                $PAGE_INDEX$: this.personSalaryTableIfy.pageIndex,
                $PAGE_SIZE$: this.personSalaryTableIfy.pageSize,
                totalCount: this.personSalaryTableIfy.totalCount,
                params: this.getCommonHttpParams(),
                redirect: this.router.url,
            };
            params[`${this.tableHelper.getTableCode('A01')}_ID`] =
                data[`${this.tableHelper.getTableCode('A01')}_ID`];
            const GL = Base64.encode(JSON.stringify(params));
            this.router.navigate(['client/career-person-salary/person-exhibition', { GL }]);
        },
        _evtReset: () => {
            this.personSalaryTableIfy.result = [];
            this.personSalaryTableIfy.totalCount = 0;
            this.personSalaryTableIfy.pageIndex = 1;
        },
        evtPageChange: (reset: boolean = false, isSelectedRow: boolean = false) => {
            if (reset) {
                this.personSalaryTableIfy._evtReset();
            }
            if (!isSelectedRow) {
                this.personSalaryTableIfy.selectedRowIndex = -1;
            }

            this.personSalaryTableIfy.mapOfCheckedId = {};
            this.personSalaryTableIfy.result = [];
            this.personSalaryTableIfy.evtRowCheckedChange();

            const data = {
                $PAGE_INDEX$: this.personSalaryTableIfy.pageIndex,
                $PAGE_SIZE$: this.personSalaryTableIfy.pageSize,
                ...this.getCommonHttpParams(),
            };
            this.personSalaryTableIfy.loading = true;
            this.service.getPersonDataPage(data).subscribe(result => {
                result.result.forEach(row => {
                    row['GZDA0708_GZDA0710'] =
                        this.personSalaryTableIfy.nulltoStr(row['GZDA0708_CN']) +
                        this.personSalaryTableIfy.nulltoStr(row['GZDA0710_CN']);
                    row['GZDA0719_GZDA0721'] = row['GZDA0719'] + row['GZDA0721'];
                    row['GZDA0709_GZDA0711'] =
                        this.personSalaryTableIfy.nulltoStr(row['GZDA0709_CN']) +
                        this.personSalaryTableIfy.nulltoStr(row['GZDA0711_CN']);
                    row['GZDA0756_GZDA0758'] = row['GZDA0756'] + row['GZDA0758'];
                    row['GZDA0724_SUM'] =
                        row['GZDA0724'] -
                        row['GZDA0748'] -
                        row['GZDA0756'] -
                        row['GZDA0758'] -
                        row['GZDA0759'] -
                        row['GZDA0750'];
                });
                this.personSalaryTableIfy.loading = false;
                result.totalCount =
                    result.totalCount > 0
                        ? result.totalCount
                        : this.personSalaryTableIfy.totalCount;
                this.personSalaryTableIfy = Object.assign(this.personSalaryTableIfy, result);
                this.cdr.detectChanges();
                // 是否选中行
                if (isSelectedRow) {
                    this.personSalaryTableElement.cdkVirtualScrollViewport.scrollToIndex(
                        this.personSalaryTableIfy.selectedRowIndex
                    );
                }
            });
        },
        nulltoStr: data => {
            if (typeof data !== 'object' || data === null || data === 'null') {
                data = '';
            }
            return data;
        },
    };

    constructor(
        private clientService: ClientService,
        private service: CareerPersonSalaryService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private workbenchService: WorkbenchService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit(): void {
        // 人员表格搜索
        this.searchKey$
            .pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(100),

                // ignore new term if same as previous term
                distinctUntilChanged()
            )
            .subscribe(keyword => {
                const data = {
                    A0101: keyword.trim(),
                    ...this.getCommonHttpParams(),
                };
                this.service.queryPersonList(data).subscribe(result => {
                    this.personTableQueryIfy.list = result;
                });
            });

        // 默认设置选中单位
        this.selectUnitIfy.selectedNode.ORG_NAME = this.sessionUser.unitName;
        this.selectUnitIfy.selectedNode.ORG_TYPE = OrgTypeEnum.UNIT;
        this.selectUnitIfy.selectedNode.ORG_B01_ID = this.sessionUser.unitId;

        this.loadPersonLibList();

        this.loadUserOperAuth();
    }

    ngAfterViewInit(): void {
        /**
         * 创建面包屑导航
         */
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '工资管理',
            },
            {
                type: 'text',
                text: '业务办理',
            },
        ]);

        // 计算表格虚拟滚动宽高
        fromEvent(window, 'resize')
            .pipe(debounceTime(300))
            .subscribe(() => {
                this.setOperListBtn();
            });
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载按钮（业务）权限
     */
    loadUserOperAuth() {
        /**
         * 获取账号权限
         */
        this.activatedRoute.data.subscribe(async (data: { tag: string }) => {
            const menus = this.commonService.getNavigeList();
            const menu = menus.find(item => item.SYSTEM_RESOURCE_GUARD_ID === data.tag);
            if (menu) {
                const authWfId = await this.workbenchService.getAuthWfId();
                this.operBtnListIfy.data = menus
                    .filter(item => item.SYS_PARENT === menu.SYSTEM_RESOURCE_TREE_ID)
                    .map(item => {
                        item.disabled = !(
                            authWfId[item.SYSTEM_RESOURCE_WF_ID] &&
                            authWfId[item.SYSTEM_RESOURCE_WF_ID].START
                        );
                        return item;
                    });
                this.cdr.detectChanges();
                this.setOperListBtn();
            }
        });
    }

    /**
     * 设置业务按钮
     */
    setOperListBtn() {
        const y = this.personTableElement.nativeElement.offsetHeight - 50 - 10 - 40 - 20; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        this.personSalaryTableIfy.BufferPx = y;
        this.personSalaryTableIfy.scroll.y = `${y}px`;
        this.personSalaryTableIfy.scroll = { ...this.personSalaryTableIfy.scroll };

        this.operBtnListIfy.list = [];
        this.operBtnListIfy.moreList = [];
        const el = this.operListElement.nativeElement;
        const btnsEl = el.querySelectorAll('button');

        let width = 0;
        btnsEl.forEach((btn, index) => {
            width += btn.offsetWidth;
            if (width >= el.offsetWidth - 110) {
                this.operBtnListIfy.moreList.push(this.operBtnListIfy.data[index]);
            } else {
                this.operBtnListIfy.list.push(this.operBtnListIfy.data[index]);
            }
        });
        this.operBtnListIfy.list = [...this.operBtnListIfy.list];
        this.operBtnListIfy.moreList = [...this.operBtnListIfy.moreList];

        this.cdr.detectChanges();
    }

    /**
     * 获得查询参数
     */
    private getCommonHttpParams() {
        const { DATA_UNIT_ORG_ID, ORG_TYPE, ORG_B01_ID } = this.selectUnitIfy.selectedNode;
        return {
            $TREE_INCLUDE_LOWER_LEVEL$: this.selectUnitIfy.level,
            DATA_UNIT_ORG_ID,
            ORG_TYPE: this.selectUnitIfy.level ? OrgTypeEnum.VIRTUAL_NODE : ORG_TYPE,
            ORG_B01_ID,
            A0103: this.pClassTabIfy.value,
            VIEW_FIELD_TYPE: UserParameterTypeEnum.PERSON_SALARY_VIEW_FIELD_CAREER,
            A0151S: ['05', '06', '07', '08', '09', '10'],
            UNIT_TYPE: '03',
        };
    }

    /**
     * 选中机构树回调
     * @param event 选中机构
     */
    evtSelectOrgChange(event) {
        this.selectUnitIfy = event;
        this.loadPersonLibList();
        // this.listTypeOptionIfy.evtChange();
    }

    /**
     * 加载人员库
     */
    private loadPersonLibList() {
        const params = {
            ...this.getCommonHttpParams(),
        };
        delete params.A0103;
        this.service.selectListByA0103Count(params).subscribe(result => {
            if (result.length > 0) {
                this.pClassTabIfy.data = result;
                const [first] = result;
                this.pClassTabIfy.value = first.value;
                this.pClassTabIfy.onSelectChange();
            }
        });
    }

    getTableCodeKey(data) {
        return data[`${this.tableHelper.getTableCode('A01')}_ID`];
    }
}
