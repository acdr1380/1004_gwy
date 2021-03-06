import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { Base64 } from 'js-base64';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SalaryDistributeService } from '../salary-distribute.service';
import { DistributeDetailService } from './distribute-detail.service';

@Component({
    selector: 'gl-distribute-detail',
    templateUrl: './distribute-detail.component.html',
    styleUrls: ['./distribute-detail.component.scss'],
})
export class DistributeDetailComponent implements OnInit {
    @ViewChild('Table', { static: false }) Table; // 人员表格
    @ViewChild('monthStateTemp', { static: false }) monthStateTemp; // 月数据子组件
    constructor(
        private clientService: ClientService,
        private activatedRoute: ActivatedRoute,
        public distributeService: SalaryDistributeService,
        private service: DistributeDetailService,
        private message: NzMessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // 面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'event',
                text: '工资发放',
                event: () => {
                    this.router.navigate(['client/salary-distribute']);
                },
            },
            {
                type: 'text',
                text: '个人',
            },
        ]);
        // 获取路由参数，加载各月直发数据
        this.loadRouterParams();
        // 跳转父级中点击的月
        this.monthStateTemp.selectedIndex = this.monthState.month;
        this.monthState.selectorRow({ month: this.monthState.month });
    }

    // 监听修改表格尺寸
    ngAfterViewInit() {
        this.computeTableScrollX();

        fromEvent(window, 'resize')
            .pipe(debounceTime(300))
            .subscribe(() => {
                this.computeTableScrollX();
            });
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    monthState = {
        year: null, // 年选中数据
        month: null, // 默认月
        unitName: '', // 机构名称
        unitId: null, // 机构id
        warpDown: false, // 机构是否已选下层
        param: {}, // 左侧月数据请求参数
        B6210: null, // 是否已归档
        data: [],
        // 改变查询年份
        yearChange: e => {
            this.monthState.year = e;
        },
        // 切换月份
        selectorRow: month => {
            this.monthState.param = {
                DATA_3001_UNIT_B62_B01_ID: this.monthState.unitId,
                YEAR: this.monthState.year,
                MONTH: month.month,
            };
            this.monthState.B6210 = month?.B6210 || this.monthState.B6210;
            this.detailTable.getData();
        },
    };

    detailTable = {
        data: [],
        loading: false,
        editParams: {},
        scroll: { y: '400px' },
        widthConfig: [
            '50px',
            '100px',
            '160px',
            '80px',
            '80px',
            '80px',
            // '130px',
            '110px',
            '110px',
            '80px',
            '80px',
            '80px',
            '80px',
            '80px',
            '80px',
            '140px',
            '100px',
            '140px',
            '50px',
            '100px',
            '100px',
            '130px',
            '100px',
            '100px',
            '130px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '80px',
            '80px',
        ],
        // 获取表格数据
        getData: () => {
            this.detailTable.loading = true;
            let param = this.monthState.param;
            this.service.getDistributeDetail(param).subscribe(res => {
                this.detailTable.data = res;
                this.detailTable.loading = false;
            });
        },
        // 删除人员工资数据
        delete: v => {
            const param = { DATA_1002_PERSON_GZ61_ID: v.DATA_1002_PERSON_GZ61_ID };
            this.service.deletePersonItem(param).subscribe(() => {
                delete this.detailTable.editParams[v.DATA_1002_PERSON_GZ61_ID];
                this.detailTable.getData();
                this.service
                    .updateSalaryData({
                        DATA_3001_UNIT_B62_B01_ID: this.monthState.unitId,
                        YEAR: this.monthState.year,
                        MONTH: this.monthState.month,
                    })
                    .subscribe();
            });
        },
        // 编辑人员工资数据
        edit: item => {
            const param = {
                DATA_1002_PERSON_GZ61_ID: item.DATA_1002_PERSON_GZ61_ID,
                GZ6119: item.GZ6119,
                GZ6120: item.GZ6120,
                GZ6121: item.GZ6121,
                GZ6122: item.GZ6122,
                GZ6123: item.GZ6123,
                GZ6124: item.GZ6124,
                GZ6125: item.GZ6125,
                GZ6126: item.GZ6126,
                GZ6127: item.GZ6127,
                GZ6128: item.GZ6128,
            };
            this.detailTable.editParams[item.DATA_1002_PERSON_GZ61_ID] = param;
        },
        // 取上月补扣发数据
        getLastMonthGZ6126: () => {
            this.detailTable.loading = true;
            const param = this.monthState.param;
            if (param['MONTH'] == 1) {
                param['YEAR'] -= 1;
                param['MONTH'] = 12;
            } else {
                param['MONTH'] -= 1;
            }
            this.service.getDistributeDetail(param).subscribe(res => {
                let index = 0;
                for (let item of res) {
                    if (item.A0184 == this.detailTable.data[index].A0184) {
                        this.detailTable.data[index].GZ6126 = item.GZ6126;
                        this.detailTable.edit(this.detailTable.data[index]);
                        index++;
                    }
                }
                this.detailTable.loading = false;
            });
        },
        // 保存并返回
        updateAndReturn: async () => {
            if (!Object.keys(this.detailTable.editParams).length) {
                this.router.navigate(['/client/salary-distribute'], {
                    queryParams: { return: 1 },
                });
                return;
            }
            const req = [];
            for (const item in this.detailTable.editParams) {
                if (this.detailTable.editParams.hasOwnProperty(item)) {
                    req.push(this.service.updatePersonItem(this.detailTable.editParams[item]));
                }
            }
            forkJoin(req).subscribe(() => {
                this.message.success('保存成功');
                let param = {
                    DATA_3001_UNIT_B62_B01_ID: this.monthState.unitId,
                    YEAR: this.monthState.year,
                    MONTH: this.monthState.month,
                };
                this.service.updateSalaryData(param).subscribe(res => {
                    this.router.navigate(['/client/salary-distribute'], {
                        queryParams: { return: 1 },
                    });
                });
            });
        },
        output: () => {
            let param = this.monthState.param;
            param['CLOUMN'] = {
                A0101: '姓名',
                A0184: '身份证号码',
                GZ6102: '发放年月',
                GZ6103: '职务工资',
                GZ6104: '级别工资',
                GZ6106: '住宅电话补贴',
                GZ6107: '移动电话补贴',
                GZ6108: '在京补贴',
                GZ6109: '保留补贴',
                GZ6110: '提租补贴',
                GZ6111: '津贴补贴',
                GZ6112: '交通补贴',
                GZ6113: '车改补贴',
                GZ6114: '艰苦边远地区津贴',
                GZ6115: '防暑降温费',
                GZ6116: '独生子女父母奖励',
                GZ6117: '奶费',
                GZ6118: '婴幼儿补贴',
                GZ6119: '取暖补贴',
                GZ6120: '年终一次性奖金',
                GZ6121: '考核奖励',
                GZ6122: '及时奖励',
                GZ6123: '未休年休假补贴',
                GZ6124: '住房补贴',
                GZ6125: '物业补贴',
                GZ6126: '补扣发',
                GZ6127: '养老保险',
                GZ6128: '职业年金',
                GZ6129: '合计',
            };
            this.service.outputDetailTable(param);
        },
    };

    // 获取路由参数
    loadRouterParams() {
        this.activatedRoute.queryParams.subscribe(async (params: ParamMap) => {
            if (params['GL']) {
                let param = JSON.parse(Base64.decode(params['GL']));
                this.monthState.unitName = param.unitName;
                this.monthState.unitId = param.unitId;
                this.monthState.warpDown = param.warpDown;
                this.monthState.year = param.year;
                this.monthState.month = param.month;
                this.monthState.B6210 = param.B6210;
            }
        });
    }

    // 计算表格尺寸
    private computeTableScrollX() {
        const el = this.Table.elementRef.nativeElement;
        const y = window.innerHeight - 315;
        this.detailTable.scroll = { y: `${y}px` };
    }
}
