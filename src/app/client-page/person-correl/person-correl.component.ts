import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
} from '@angular/core';
import { ClientService } from 'app/master-page/client/client.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'app/util/common.service';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WorkbenchService } from 'app/workflow/workbench/workbench.service';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';

import { Base64 } from 'js-base64';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { SelectOrgDrawerComponent } from 'app/components/select-org/select-org-drawer/select-org-drawer.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { PersonCorrelService } from './person-correl.service';
import { PersonOrderComponent } from './person-order/person-order.component';
import { PersonVerifyComponent } from './person-verify/person-verify.component';
import { HeadFieldsAdjustComponent } from './head-fields-adjust/head-fields-adjust.component';

@Component({
    selector: 'gl-person-correl',
    templateUrl: './person-correl.component.html',
    styleUrls: ['./person-correl.component.scss'],
})
export class PersonCorrelComponent implements OnInit, AfterViewInit {
    orgTypeEnum = OrgTypeEnum;
    /**
     * 当前账号信息
     */
    sessionUser = this.commonService.getUserLoginInfo();

    @ViewChild('headFieldsAdjustElement') headFieldsAdjustElement: HeadFieldsAdjustComponent;

    @ViewChild('operListElement') operListElement: ElementRef;
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
    @ViewChild('personOrderElement', { static: false })
    personOrderElement: PersonOrderComponent;
    @ViewChild('personVerifyElement', { static: false })
    personVerifyElement: PersonVerifyComponent;

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

        headPermission: () => {
            // return this.listTypeOptionIfy.mode === ListTypeEnum.BASE
            //     ? 'person_list_fields'
            //     : 'person_list_salary_fields';
        },
        fieldsChange: () => {
            // this.listTypeOptionIfy.evtChange();
            // this.buildTableHeader(this.headhandleIfy.userParameterType(), event);
        },
        evtChange: () => {
            // this.personSalaryTableIfy.evtPageChange();
        },
        evtFieldsAdjust: () => {
            this.headFieldsAdjustElement.show();
        },

        orderParams: null,
        evtPersonOrder: () => {
            if (!this.selectUnitIfy.selectedNode.ORG_B01_ID) {
                return;
            }
            this.headhandleIfy.orderParams = {
                ORG_B01_ID: this.selectUnitIfy.selectedNode.ORG_B01_ID,
                A0103: this.personConditionIfy.personLibTab.value,
                UNIT_TYPE: this.personConditionIfy.unitType.value,
                ORG_TYPE: this.personConditionIfy.unitType.value,
            };
            this.personOrderElement.show();
        },

        evtDataVerify: () => {
            this.personVerifyElement.show();
        },
        evtDownExcel: (FORM_PERMISSION?) => {
            let personArr = [];
            personArr = this.personTableIfy.result
                .filter(item => item.checked)
                .map(item => item[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const data = {
                ...this.getCommonCondtion(),
                FORM_PERMISSION,
                // SYS_FORM_ID: '747492817990848512',
                FORM_VERSION: 1,
            };
            data[`${this.tableHelper.getTableCode('A01')}_IDS`] = personArr;
            this.service.batDownloadExcel(data);
        },
        evtDownLrmx: () => {
            let personArr = [];
            personArr = this.personTableIfy.result
                .filter(item => item.checked)
                .map(item => item[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const data = {
                ...this.getCommonCondtion(),
            };
            data[`${this.tableHelper.getTableCode('A01')}_IDS`] = personArr;
            this.service.downloadLrmx(data);
        },
        evtDownPersonList: () => {
            let personArr = [];
            personArr = this.personTableIfy.result
                .filter(item => item.checked)
                .map(item => item[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const data = {
                ...this.getCommonCondtion(),
            };
            data[`${this.tableHelper.getTableCode('A01')}_IDS`] = personArr;
            this.service.outputExcelByOrgId(data);
        },
    };

    @ViewChild('selectOrgDrawerElement', { static: false })
    selectOrgDrawerElement: SelectOrgDrawerComponent;
    /**
     * 选中单位
     */
    selectUnitIfy = {
        level: false,
        selectedNode: <any>{},
        evtLevelChange: () => { },
        affirmSelectedChange: ({ level, selectedNode }) => {
            this.selectUnitIfy.level = level;
            this.selectUnitIfy.selectedNode = selectedNode;
            this.personTableIfy.evtPageChange();
        },
    };

    /**
     * 人员查询条件
     */
    personConditionIfy = {
        /**
         * 人员库
         */
        personLibTab: {
            codeId: 'C',
            nzShowPagination: true,
            value: null,
            nzType: 'line',
            selectedIndex: 0,
            list: [],
            loadList: () => {
                this.service.selectListByPersonPool().subscribe(result => {
                    this.personConditionIfy.personLibTab.list = result;
                    const [first] = result;
                    this.personConditionIfy.personLibTab.value = first.value;

                    // 人员库加载完成就可以取数了
                    // this.personTableIfy.evtPageChange();
                });
            },
            onSelectChange: ({ index }) => {
                this.personConditionIfy.personLibTab.value =
                    this.personConditionIfy.personLibTab.list[index].value;
                this.personTableIfy.evtPageChange();
            },
        },

        /**
         * 管理类别
         */
        adminCategor: {
            codeId: 'XZ46',
            value: '-1',
            list: [{ label: '全部', value: '-1' }],
            loadList: () => {
                this.service
                    .getCodeList(this.personConditionIfy.adminCategor.codeId)
                    .subscribe(result => {
                        this.personConditionIfy.adminCategor.list =
                            this.personConditionIfy.adminCategor.list.concat(result);
                    });
            },
            evtChange: () => {
                this.personTableIfy.evtPageChange();
            },
        },

        /**
         * 统计类别
         */
        unitType: {
            list: [
                { label: '按任职单位', value: '01' },
                { label: '按统计单位', value: '02' },
            ],
            value: '01',
            evtChange: () => {
                this.personTableIfy.evtPageChange();
            },
        },

        evtInit: () => {
            this.personConditionIfy.personLibTab.loadList();
            this.personConditionIfy.adminCategor.loadList();
        },
    };

    // 人员表格
    @ViewChild('personTableView') personTableView: ElementRef;
    @ViewChild('personTable') personTable: NzTableComponent;
    personTableIfy = {
        result: [],
        pageIndex: 1,
        pageSize: 30,
        totalCount: 0,
        BufferPx: 500,
        scroll: { x: '1200px', y: '500px' },
        loading: false,

        selectedRowIndex: -1,
        leftColumn: ['A0101'],
        fields: [],

        evtViewDetails: data => {
            globalThis.event.preventDefault();
            const key = `${this.tableHelper.getTableCode('A01')}_ID`;
            const params = {};
            params[key] = data[key];
            const GL = Base64.encode(JSON.stringify(params));
            const url = `irregular/form-page;GL=${GL}`;
            window.winAppointFormDlg = window.open(url, 'form-page');
            if (window.winAppointFormDlg && window.winAppointFormDlg.closed) {
                window.winAppointFormDlg.focus();
            }
        },

        allChecked: false,
        checkList: [],
        evtCheckAll: (value: boolean) => {
            this.personTableIfy.result.forEach(row => (row.checked = value));
            this.personTableIfy._getCheckList();
        },
        evtCheckRow: row => {
            this.personTableIfy._getCheckList();
        },
        _getCheckList: () => {
            this.personTableIfy.checkList = this.personTableIfy.result.filter(row => row.checked);
        },

        _evtReset: () => {
            this.personTableIfy.result = [];
            this.personTableIfy.totalCount = 0;
            this.personTableIfy.pageIndex = 1;
        },
        evtPageChange: (reset: boolean = false, isSelected: boolean = false) => {
            if (reset) {
                this.personTableIfy._evtReset();
            }
            this.personTableIfy.allChecked = false;
            if (!isSelected) {
                this.personTableIfy.selectedRowIndex = -1;
            }
            const params: any = this.getCommonCondtion();
            this.personTableIfy.loading = true;
            params.$PAGE_INDEX$ = this.personTableIfy.pageIndex;
            params.$PAGE_SIZE$ = this.personTableIfy.pageSize;
            // const mode = this.listTypeOption.mode;
            // const setId = mode === this.listTypeEnum.TABLE ? 'a01' : 'a01photo';
            this.service.getPersonDataPage(params).subscribe(data => {
                this.personTableIfy.loading = false;
                if (data.totalCount > 0) {
                    this.personTableIfy.totalCount = data.totalCount;
                }
                this.personTableIfy.result = data.result;
                this.cdr.detectChanges();
                // 是否选中行
                if (isSelected) {
                    this.personTable.cdkVirtualScrollViewport.scrollToIndex(
                        this.personTableIfy.selectedRowIndex
                    );
                } else {
                    this.personTable.cdkVirtualScrollViewport.scrollToIndex(0);
                }

                this.computeTableScrollX();
            });
        },

        evtSelectorRow: index => {
            this.personTableIfy.selectedRowIndex = index;
        },

        // 人员查询
        find: {
            list: [],
            keyword: null,
            evtOpenChange: status => {
                if (status) {
                    this.personTableIfy.find.keyword = null;
                }
            },
            evtOnSearch: (keyValue: string) => {
                if (keyValue) {
                    const data = this.getCommonCondtion({
                        A0101: keyValue.trim(),
                    });
                    this.service
                        .queryPersonList(data)
                        .subscribe(result => (this.personTableIfy.find.list = result));
                }
            },
            evtChange: value => {
                if (value === null) {
                    return;
                }
                const data = this.getCommonCondtion();
                data[`${this.tableHelper.getTableCode('A01')}_ID`] = value;
                this.service.queryPersonRowNumber(data).subscribe(num => {
                    // tslint:disable-next-line:radix
                    this.personTableIfy.pageIndex =
                        // tslint:disable-next-line:radix
                        parseInt((num / this.personTableIfy.pageSize).toString()) + 1;
                    this.personTableIfy.selectedRowIndex = num % this.personTableIfy.pageSize;
                    this.personTableIfy.evtPageChange(false, true);
                });
            },
        },
    };

    /**
     * excel导出
     */
    documentOutputIfy = {
        downloadLRMX: () => {
            if (this.personTableIfy.checkList.length === 0) {
                this.message.warning('请先勾选需要导出文件的人员。');
                return;
            }
            const params = {
                DATA_3001_PERSON_A01_IDS: this.personTableIfy.checkList.map(p => p[`${this.tableHelper.getTableCode('A01')}_ID`])
            };
            this.commonService.downFilePost(
                'api/gl-service-data-civil/v1/data/person/a01/downloadLrmx',
                params
            );
        },
    };

    constructor(
        private clientService: ClientService,
        private service: PersonCorrelService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private workbenchService: WorkbenchService,
        private workflowService: WorkflowService,
        private tableHelper: WfTableHelper,
        private message: NzMessageService,
    ) { }

    ngOnInit(): void {
        // 默认设置选中单位
        this.selectUnitIfy.selectedNode.ORG_NAME = this.sessionUser.unitName;
        this.selectUnitIfy.selectedNode.ORG_TYPE = OrgTypeEnum.UNIT;
        this.selectUnitIfy.selectedNode.ORG_B01_ID = this.sessionUser.unitId;

        this.personConditionIfy.evtInit();
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
                text: '人员管理',
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
                this.computeTableScrollX();
            });

        this.loadUserFields();
        this.loadUserOperAuth();
        this.computeTableScrollX();
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
    }

    /**
     * 计算表格的高度
     */
    computeTableScrollX() {
        const y = this.personTableView.nativeElement.offsetHeight - 150; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        const x =
            this.personTableIfy.fields
                .map(v => v.width)
                .reduce(function (prev, curr) {
                    return prev + curr;
                }) + 100;
        this.personTableIfy.BufferPx = y;
        this.personTableIfy.scroll.y = `${y}px`;
        this.personTableIfy.scroll.x = `${x}px`;
        this.personTableIfy.scroll = { ...this.personTableIfy.scroll };
    }

    /**
     * 获取人员查询条件
     */
    private getCommonCondtion(customOption = {}) {
        const { DATA_UNIT_ORG_ID, ORG_TYPE, ORG_B01_ID } = this.selectUnitIfy.selectedNode;
        return {
            $TREE_INCLUDE_LOWER_LEVEL$: this.selectUnitIfy.level,
            DATA_UNIT_ORG_ID,
            ORG_TYPE: this.selectUnitIfy.level ? OrgTypeEnum.VIRTUAL_NODE : ORG_TYPE,
            ORG_B01_ID,
            A0103: this.personConditionIfy.personLibTab.value,
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
            A0165: this.personConditionIfy.adminCategor.value,
            VIEW_FIELD_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL,
            UNIT_TYPE: this.personConditionIfy.unitType.value,
            ...customOption,
        };
    }

    /**
     * 加载账号 基本信息 所选显示字段
     * @param parameterType 加载类型
     */
    private loadUserFields() {
        if (this.personTableIfy.fields.length > 0) {
            return;
        }
        const data = {
            USER_PARAMETER_USER_ID: this.sessionUser.userId,
            USER_PARAMETER_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL,
            SCHEME_PERMISSION: 'user_defined_list_fields',
        };
        this.service.selectUserIdFields(data).subscribe(result => {
            // if (result.length === 0) {
            //     this.loadDefaultFields(parameterType);
            //     return;
            // }

            this.personTableIfy.fields = result.map(v => ({
                ...v,
                title: v.SCHEME_HEADER_DISPLAY_NAME,
                width: v.SCHEME_HEADER_DISPLAY_WIDTH,
                key: v.TABLE_COLUMN_CODE,
            }));
        });
    }

    /**
     * 字段调整完成事件
     */
    headFieldsChange(result) {
        this.personTableIfy.fields = result.map(v => ({
            ...v,
            title: v.SCHEME_HEADER_DISPLAY_NAME,
            width: v.SCHEME_HEADER_DISPLAY_WIDTH,
            key: v.TABLE_COLUMN_CODE,
        }));
        this.personTableIfy.evtPageChange();
    }
}
