import { Component, OnInit, ViewChild } from '@angular/core';
import { ClientService } from 'app/master-page/client/client.service';
import { SalaryDistributeService } from './salary-distribute.service';
import { SelectUnitLevelComponent } from '../../components/select-unit-level/select-unit-level.component';
import { Base64 } from 'js-base64';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from 'app/util/common.service';

@Component({
    selector: 'gl-salary-distribute',
    templateUrl: './salary-distribute.component.html',
    styleUrls: ['./salary-distribute.component.scss'],
})
export class SalaryDistributeComponent implements OnInit {
    @ViewChild('selectUnitLevelElement') selectUnitLevelElement: SelectUnitLevelComponent; // 单位树
    @ViewChild('Table', { static: false }) Table; // 单位发放数据表格
    @ViewChild('monthState', { static: false }) monthState;
    defaultLoad;

    constructor(
        public service: SalaryDistributeService,
        private clientService: ClientService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private commonService: CommonService
    ) {}

    // 面包屑导航
    ngOnInit(): void {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '工资发放',
            },
        ]);
    }

    // 监听修改表格尺寸
    ngAfterViewInit() {
        this.computeTableScrollY();
        fromEvent(window, 'resize')
            .pipe(debounceTime(300))
            .subscribe(() => {
                this.computeTableScrollY();
            });
        this.activatedRoute.queryParams.subscribe(async (params: ParamMap) => {
            if (params['return']) {
                this.commonService.getUserInfoByCache().then(res => {
                    this.defaultLoad = res['B01_NAME'];
                });
            }
        });
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    // 表格数据
    salaryTable = {
        data: [],
        loading: false,
        selectedIndex: -1,
        scroll: { y: '500px' },
        month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 月可选数据
        // 表格数据筛选参数
        filterValue: {
            state: 0,
            year: 0,
            month: 0,
        },
        // 更改筛选参数
        filterChange: (flag, e) => {
            // 当年显示到当前月份+1月
            if (flag == 'year') {
                this.salaryTable.month =
                    e !== this.service.year
                        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].slice(0, this.service.month + 1);
                if (this.salaryTable.filterValue.month > this.service.month + 1)
                    this.salaryTable.filterValue.month = 0;
            }
            this.salaryTable.loadTableData();
        },
        getParam: () => {
            const nodes = this.selectUnitLevelElement.getSelectedUnitList();
            if (nodes.length) {
                let { state, year, month } = this.salaryTable.filterValue;
                let param = {
                    QUERY_ORG_LIST: [],
                };
                param.QUERY_ORG_LIST = nodes.map(item => {
                    return {
                        $TREE_INCLUDE_LOWER_LEVEL$: item.origin.includeChild || false,
                        DATA_UNIT_ORG_ID: item.key,
                    };
                });
                if (state != 0) param['STATE'] = String(state);
                if (year != 0) param['YEAR'] = Number(year);
                if (month != 0) param['MONTH'] = Number(month);
                return param;
            }
        },
        // 加载表格数据
        loadTableData: () => {
            const nodes = this.selectUnitLevelElement.getSelectedUnitList();
            if (nodes.length) {
                this.salaryTable.loading = true;
                let param = this.salaryTable.getParam();
                this.service.getDistributionInfo(param).subscribe(res => {
                    this.salaryTable.data = res;
                    this.salaryTable.loading = false;
                });
            } else {
                this.salaryTable.data = [];
            }
        },
        output: () => {
            const nodes = this.selectUnitLevelElement.getSelectedUnitList();
            if (nodes.length) {
                let param = this.salaryTable.getParam();
                param['COLUMN'] = {
                    SYS_CREATE_ORG_NAME: '单位名称',
                    B6202: '人数',
                    B6203: '发放年月',
                    B6204: '基本工资总额',
                    B6205: '津补贴总额',
                    B6206: '一次性发放总额',
                    B6207: '补扣发总额',
                    B6208: '扣款总额',
                    B6209: '应发总额',
                    B6210_CN: '状态',
                };
                this.service.outputDistribute(param);
            }
        },
        // 跳转详细信息
        viewDetail: value => {
            const param = {
                unitName: value.SYS_MODIFY_ORG_NAME,
                unitId: value.DATA_3001_UNIT_B62_B01_ID,
                year: this.salaryTable.filterValue.year || new Date().getFullYear(),
                month: new Date(value.B6203).getMonth() + 1,
                warpDown: false,
                B6210: value.B6210 + '',
            };
            const GL = Base64.encode(JSON.stringify(param));
            this.router.navigate(['client/salary-distribute/distribute-detail'], {
                queryParams: { GL },
            });
        },
        // 归档
        changeState: item => {
            let param = {
                DATA_3001_UNIT_B62_ID: item.allValues.DATA_3001_UNIT_B62_ID,
                B6210: '2',
            };
            this.service
                .changeState(param)
                .subscribe(res => (item = this.salaryTable.loadTableData()));
        },
        // 删除直发数据
        delete: item => {
            let param = {
                DATA_3001_UNIT_B62_ID: item.allValues.DATA_3001_UNIT_B62_ID,
            };
            this.service.deleteDistribute(param).subscribe(res => {
                this.salaryTable.loadTableData();
            });
        },
        // 选中行
        selectorRow: index => (this.salaryTable.selectedIndex = index),
    };

    // 生成直发数据抽屉
    drawer = {
        data: [],
        visible: false,
        distributeNew: false,
        year: new Date().getFullYear(),
        param: {},
        haveDistributeData: false,
        checkHaveDistributeData: e => {
            this.drawer.haveDistributeData = e;
        },
        open: () => {
            this.drawer.visible = true;
            if (this.monthState.data.length) {
                this.monthState.getState();
            }
        },
        close: () => (this.drawer.visible = false),
        // 改变查询年份
        yearChange: e => (this.drawer.year = e),
        // 直发选择单位、人员
        checkPerson: e => {
            this.drawer.param = e;
            this.drawer.haveDistributeData = false;
        },
    };

    // 计算表格尺寸
    private computeTableScrollY() {
        const el = this.Table.elementRef.nativeElement;
        const y = window.innerHeight - 315;
        this.salaryTable.scroll = { y: `${y}px` };
    }
}
