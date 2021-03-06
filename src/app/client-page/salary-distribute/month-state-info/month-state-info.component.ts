import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SalaryDistributeService } from '../salary-distribute.service';

@Component({
    selector: 'gl-month-state-info',
    templateUrl: './month-state-info.component.html',
    styleUrls: ['./month-state-info.component.scss'],
})
export class MonthStateInfoComponent implements OnInit {
    dataMap = new Map(); // 初始化各月状态
    data = []; // 各月数据
    selectedIndex = 0; // 选中行
    @Input() year: number; // 请求年份
    @Input() month: number; // 默认请求月份
    @Input() unitId: string; // 单位ID
    @Input() list: any[]; // 选中人员列表
    @Input() CanDistribute: boolean; // 是否能够生成
    @Output() loadTableData = new EventEmitter<any>(); // 刷新单位直发数据
    @Output() click = new EventEmitter<any>(); // 查询该月直发详细
    @Output() checkHaveDistributeData = new EventEmitter<any>();

    constructor(public service: SalaryDistributeService) {}

    ngOnInit(): void {
        // 初始化年可选数据
        if (!this.service.yearRange.length) {
            for (let i = this.service.year; i >= 2006; i--) {
                this.service.yearRange.push(i);
            }
        }
    }

    // 参数变化重新请求月数据
    ngOnChanges(changes) {
        if (!Object.values(changes)[0]['firstChange']) {
            this.getState();
        }
    }

    // 获取数据
    getState() {
        // 初始化月数据
        this.dataMap.clear();
        let maxMonth = this.year == this.service.year ? this.service.month + 1 : 12;
        for (let i = 1; i < maxMonth + 1; i++) {
            this.dataMap.set(i, { month: i, key: 0, value: '点击生成' });
        }
        // 加载已有数据
        if (this.CanDistribute) {
            let param = {
                QUERY_ORG_LIST: [
                    {
                        $TREE_INCLUDE_LOWER_LEVEL$: false,
                        DATA_UNIT_ORG_ID: this.unitId,
                    },
                ],
                YEAR: this.year,
            };
            this.service.getDistributionInfo(param).subscribe(res => {
                if (res.length) {
                    this.checkHaveDistributeData.emit(true);
                    for (let i = 1; i < new Date(res[0].allValues.B6203).getMonth() + 1; i++) {
                        this.dataMap.set(i, {
                            month: i,
                            key: -1,
                            value: '该月数据已过期，无法继续生成',
                        });
                    }
                }
                for (let item of res) {
                    let month = new Date(item.allValues.B6203).getMonth() + 1;
                    this.dataMap.set(month, {
                        month,
                        key: item.allValues.B6210,
                        value: item.allValues.B6210_CN,
                        data: item.allValues,
                    });
                }
                this.data = [...this.dataMap.values()];
            });
        } else {
            let param = {
                B01_ID: this.unitId,
                YEAR: this.year,
            };
            this.service.getGenerateInfo(param).subscribe(res => {
                for (let item of res) {
                    let month = new Date(item.allValues.B6203).getMonth() + 1;
                    this.dataMap.set(month, {
                        month,
                        key: item.allValues.B6210,
                        value: item.allValues.B6210_CN,
                        data: item.allValues,
                    });
                }
                this.data = [...this.dataMap.values()];
            });
        }
    }

    // 生成直发
    distribute(month, event) {
        event.stopPropagation(); // 阻止冒泡，避免未生成数据便选中行
        const param = {
            QUERY_ORG_LIST: [
                {
                    $TREE_INCLUDE_LOWER_LEVEL$: false,
                    DATA_UNIT_ORG_ID: this.unitId,
                },
            ],
            YEAR: this.year,
            MONTH: month,
        };
        if (this.list) {
            param['KEY_IDS'] = this.list.map(item => {
                return item.DATA_3001_PERSON_A01_ID;
            });
        }
        this.service.distributeSalary(param).subscribe(res => {
            this.getState();
            this.loadTableData.emit();
        });
    }

    // 选中行
    clickRow(i, event) {
        event.stopPropagation();
        this.selectedIndex = i;
        if (this.data[i - 1].data) {
            const month = new Date(this.data[i - 1].data.B6203).getMonth() + 1;
            this.click.emit({ month, B6210: this.data[i - 1].data.B6210 });
        }
    }
}
