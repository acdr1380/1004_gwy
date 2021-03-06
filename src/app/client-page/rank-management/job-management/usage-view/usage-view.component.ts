import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'app/components/loading/loading.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { JobManagementService } from '../job-management.service';

@Component({
    selector: 'gl-usage-view',
    templateUrl: './usage-view.component.html',
    styleUrls: ['./usage-view.component.scss'],
})
export class UsageViewComponent implements OnInit {
    /** 当前选中的机构节点 */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
            if (this.headerIfy.B0604 || this.headerIfy.B0605) {
                this.headerIfy.startQuery();
            }
        }
    }
    get node() {
        return this._node;
    }

    zh_CN = <any>{};

    isShow: boolean = false;

    tableId = this.tableHeleper.getTableCode('B06');

    /** 顶部字段条件 */
    headerIfy = {
        zh_CN: <any>{},
        B0604: null,
        B0605: null,
        startQuery: () => {
            if (!this.node) {
                return this.message.warning('请先选择单位！');
            }
            this.unitMsgIfy.loadData();
            this.positionsIfy.getListData();
            this.positionsUseIfy.loadData();

            this.isShow = true;
        },
    };

    /** 单位基本信息 */
    unitMsgIfy = {
        data: <any>{},
        loadData: async () => {
            const param = {};
            param[this.tableHeleper.getTableCode('B01') + '_ID'] = this.node.origin.ORG_B01_ID;
            param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
            const b01_data = await this.service.getUnitInfo(param).toPromise();
            const b06_data = await this.service.getLastRow(param).toPromise();

                this.unitMsgIfy.data = {
                    ...b01_data,
                    ...b06_data,
                };

        },
    };

    /** 职数核定 */
    positionsIfy = {
        list: [],
        fields: [],

        data: <any>{},
        getListData: async () => {
            const _loading = this.loading.show();
            const scheme = await this.getSchemeContent();
            scheme.systemSchemeEdit.forEach(field => {
                this.positionsIfy.fields = [...this.positionsIfy.fields, field];
            });
            await this.getHitoryRecord();
            await this.getThSum();
            _loading.close();
        },
    };

    /** 职数使用 */
    positionsUseIfy = {
        fields: [[{ a: 1 }]],
        loadData: async () => {
            const param = {
                B0605: this.headerIfy.B0605,
                ORG_B01_ID: this.node.origin.ORG_B01_ID,
            };
            const data = await this.service.getUseInfo(param).toPromise();

            if (data) {
                // 转换未4个一组的二维数组
                let productData = [];
                let num = Math.ceil(data.length / 4);
                for (let i = 0; i < num; i++) {
                    productData.push(data.slice(i * 4, i * 4 + 4));
                }

                this.positionsUseIfy.fields = productData;
            }
        },
    };

    /** 反差抽屉 */
    reverseLookup = {
        visible: false,
        width: 500,
        title: '反查人员',
        current: null,
        open: (item: any) => {
            this.reverseLookup.visible = true;
            this.reverseLookup.current = item;
            this.reverseLookup.table.init(item);
        },
        close: () => {
            this.reverseLookup.visible = false;
            this.reverseLookup.current = null;
        },

        table: {
            rows: [],
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            loading: false,
            init: (item) => {
                const param = {
                    FIELD: item.ITEM_ID,
                    ORG_B01_ID: this.node.origin.ORG_B01_ID,
                    $QUERY_FIELDS$: 'A0101,A0104,A0184',
                    $PAGE_INDEX$: this.reverseLookup.table.pageIndex,
                    $PAGE_SIZE$: this.reverseLookup.table.pageSize,
                };

                this.reverseLookup.table.loading = true;
                this.service.peverseLookUp(param).subscribe(res => {
                    this.reverseLookup.table.loading = false;

                    this.reverseLookup.table.rows = res.result;
                    if (res.pageIndex === 1) {
                        this.reverseLookup.table.total = res.totalCount;
                    }
                });
            },
        },
    };

    constructor(
        private service: JobManagementService,
        private commonService: CommonService,
        private loading: LoadingService,
        private tableHeleper: WfTableHelper,
        private message: NzMessageService
    ) {}

    ngOnInit(): void {}

    /** 取界面方案字段 */
    private async getSchemeContent() {
        // 删除上一次的字段
        if (this.positionsIfy.fields.length > 0) {
            this.positionsIfy.fields = [];
        }

        let scheme = 'job_management_01';
        if (this.headerIfy.B0604 === '0101' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_01';
        } else if (this.headerIfy.B0604 === '0102' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_02';
        } else if (this.headerIfy.B0604 === '0103' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_03';
        } else if (this.headerIfy.B0604 === '0104' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_04';
        } else if (this.headerIfy.B0604 === '0105' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_05';
        } else if (this.headerIfy.B0604 === '0106' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_06';
        } else if (this.headerIfy.B0604 === '0107' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_07';
        } else if (this.headerIfy.B0604 === '0108' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_08';
        } else if (this.headerIfy.B0604 === '0109' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_09';
        } else if (this.headerIfy.B0604 === '0110' && this.headerIfy.B0605 === '01') {
            scheme = 'job_management_10';
        } else if (this.headerIfy.B0604 === '0201' && this.headerIfy.B0605 === '02') {
            scheme = 'job_management_11';
        } else if (this.headerIfy.B0604 === '0202' && this.headerIfy.B0605 === '02') {
            scheme = 'job_management_12';
        } else if (this.headerIfy.B0604 === '0203' && this.headerIfy.B0605 === '02') {
            scheme = 'job_management_13';
        } else if (this.headerIfy.B0604 === '0301' && this.headerIfy.B0605 === '03') {
            scheme = 'job_management_14';
        } else if (this.headerIfy.B0604 === '0302' && this.headerIfy.B0605 === '03') {
            scheme = 'job_management_15';
        } else if (this.headerIfy.B0604 === '0303' && this.headerIfy.B0605 === '03') {
            scheme = 'job_management_16';
        }
        return await this.commonService.getFieldSchemeConent(scheme).toPromise();
    }

    /** 获取核定数 */
    async getHitoryRecord() {
        const { B0604, B0605 } = this.headerIfy;
        const param = {
            B0604,
            B0605,
        };
        param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
        const data = await this.service.getRecord(param).toPromise();
        if (data) {
            this.positionsIfy.data = { ...this.positionsIfy.data, ...data };
        }
    }

    /** 获取实有数 */
    async getThSum() {
        const param = {
            $QUERY_FIELDS$: this.positionsIfy.fields.map(x => x.TABLE_COLUMN_CODE),
        };
        param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
        const data = await this.service.getTheSum(param).toPromise();
        if (data) {
            this.positionsIfy.data = { ...this.positionsIfy.data, ...data };
        }
    }
}
