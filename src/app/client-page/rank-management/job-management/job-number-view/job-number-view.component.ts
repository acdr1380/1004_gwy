import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'app/components/loading/loading.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { JobManagementService } from '../job-management.service';

@Component({
    selector: 'gl-job-number-view',
    templateUrl: './job-number-view.component.html',
    styleUrls: ['./job-number-view.component.scss'],
})
export class JobNumberViewComponent implements OnInit {
    /** 当前选中的机构节点 */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
            this.jobNumberIfy.loadRows();
            this.loadSelectOption();
        }
    }
    get node() {
        return this._node;
    }

    zh_CN = <any>{};

    tableId = this.tableHeleper.getTableCode('B06');

    /** 顶部字段条件 */
    headerIfy = {
        zh_CN: <any>{},
        B0604: null,
        B0604_list: [],
        B0605: null,
        B0605_list: [],
    };

    /** 职数表格 */
    jobNumberIfy = {
        rows: [],
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        sizeOption: [10, 15, 20, 25, 30],
        loading: false,
        loadRows: () => {
            const param = {
                $PAGE_SIZE$: this.jobNumberIfy.pageSize,
                $PAGE_INDEX$: this.jobNumberIfy.pageIndex,
                B0604: this.headerIfy.B0604,
                B0605: this.headerIfy.B0605,
            };
            param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
            this.jobNumberIfy.loading = true;
            this.service.getJobNumDate(param).subscribe(res => {
                this.jobNumberIfy.loading = false;

                this.jobNumberIfy.rows = res.result.map(x => {
                    return {
                        ...x,
                        BzNum: this.getBzNum(x, 'B0608', 'B0609', 'B0610'),
                        countNum: this.getCountNum(x),
                    };
                });
                if (res.pageIndex === 1) {
                    this.jobNumberIfy.total = res.totalCount;
                }
            });
        },
        // 删除
        remove: item => {
            const param = {};
            param[this.tableId + '_ID'] = item[this.tableId + '_ID'];
            const _loading = this.loading.show();
            this.service.postDeleteJobNum(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    // const index = this.jobNumberIfy.rows.findIndex(
                    //     x => x[this.tableId + '_ID'] === item[this.tableId + '_ID']
                    // );

                    // this.jobNumberIfy.rows.splice(index, 1);
                    // this.jobNumberIfy.rows = [...this.jobNumberIfy.rows];

                    this.jobNumberIfy.loadRows();
                }
            });
        },
    };

    /** 添加职数抽屉 */
    addJobNumIfy = {
        visible: false,
        title: '添加职数信息',
        width: 900,

        // 是否是统筹
        isTC: false,
        TCValue: null,
        TCText: null,

        // 表格双击显示用,保存点击的项
        current: null,

        // old值
        old_entity: {},
        // 点击添加
        open: async () => {
            if (!this.node) {
                this.message.warning('请先选择单位！');
                return;
            }

            if (this.addJobNumIfy.fields.length === 0) {
                await this.getFields();
            }

            this.addJobNumIfy.visible = true;
        },
        // 双击显示
        show: async item => {
            if (this.addJobNumIfy.fields.length === 0) {
                await this.getFields();
            }
            this.addJobNumIfy.current = item;

            this.addJobNumIfy.form.reset(item, { emitEvent: false });
            this.zh_CN = item;
            this.addJobNumIfy.form.disable({ emitEvent: false });

            this.addJobNumIfy.visible = true;
        },
        close: () => {
            this.addJobNumIfy.visible = false;
            this.addJobNumIfy.form.reset({ B0606: '01' }, { emitEvent: false });
            this.addJobNumIfy.current = null;
            this.addJobNumIfy.TCValue = null;
            this.addJobNumIfy.TCText = null;
            this.addJobNumIfy.form.enable();
            this.zh_CN = {};
        },

        form: new FormGroup({
            B0601: new FormControl(null, Validators.required), // 方案名称
            B0602: new FormControl(null, Validators.required), // 变动时间
            B0603: new FormControl(null, Validators.required), // 变动文号
            B0604: new FormControl(null, Validators.required), // 方案类别
            B0605: new FormControl(null, Validators.required), // 岗位类别
            B0606: new FormControl('01', Validators.required), // 变动类别

            B0608: new FormControl(null),
            B0609: new FormControl(null),
            B0610: new FormControl(null),
            B0611: new FormControl(null),
        }),

        fields: [],
        save: () => {
            if (!this.formVerify(this.addJobNumIfy.form)) {
                return;
            }
            const param = {
                OLD_ENTITY: this.addJobNumIfy.old_entity,
                NEW_ENTITY: {
                    ...this.addJobNumIfy.form.getRawValue(),
                    DATA_3001_UNIT_B06_B01_ID: this.node.origin.ORG_B01_ID,
                },
                B06A_QUERT: this.addJobNumIfy.fields.map(x => ({
                    TABLE_COLUMN_CODE: x.TABLE_COLUMN_CODE,
                    TABLE_COLUMN_NAME: x.TABLE_COLUMN_NAME,
                })),
            };
            // 选择了计划
            if (this.addJobNumIfy.TCValue) {
                param[this.tableHeleper.getTableCode('B06A') + '_ID'] = this.addJobNumIfy.TCValue;
            }

            const _loading = this.loading.show();
            this.service.postInsertJobNum(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    this.jobNumberIfy.rows = [
                        ...this.jobNumberIfy.rows.map(x => ({ ...x, IS_LAST_ROW: false })),
                        res.data,
                    ];

                    this.loadSelectOption();
                    this.addJobNumIfy.close();
                }
            });
        },
    };

    /** 选择统筹计划 */
    choosePlanIfy = {
        visible: false,
        width: 300,
        title: '选择统筹计划',
        open: () => {
            this.choosePlanIfy.loadList();
            this.choosePlanIfy.visible = true;
        },
        close: () => {
            this.choosePlanIfy.visible = false;
        },

        list: [],
        current: null,

        loadList: () => {
            this.service.getPlanList().subscribe(res => {
                this.choosePlanIfy.list = res;
            });
        },
        enter: () => {
            if (!this.choosePlanIfy.current) {
                return this.message.warning('请选择统筹设置!');
            }

            this.addJobNumIfy.TCValue = this.choosePlanIfy.current;
            this.addJobNumIfy.TCText = this.choosePlanIfy.list.find(
                x => x.DATA_3001_UNIT_B06A_ID === this.choosePlanIfy.current
            ).B06A01;

            this.choosePlanIfy.close();
        },
    };

    /** 使用情况抽屉 */
    useSituationIfy = {
        visible: false,
        title: '统筹使用情况',
        width: 600,
        current: null,
        open: () => {
            this.useSituationIfy.visible = true;
            this.useSituationIfy.table.loadRows();
        },
        close: () => {
            this.useSituationIfy.visible = false;
        },

        // 表格
        table: {
            rows: [],
            pageSize: 10,
            pageIndex: 1,
            loading: false,
            sizeOption: [10, 15, 20, 25, 30],
            loadRows: () => {
                this.useSituationIfy.table.rows = this.choosePlanIfy.list.filter(
                    x => x.DATA_3001_UNIT_B06A_ID === this.choosePlanIfy.current
                );
                // const params = {
                //     B06B01: this.addJobNumIfy.TCValue,
                // };
                // this.service.getCheckList(params).subscribe(json => {
                //     this.useSituationIfy.table.rows = json;
                // });
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

    ngOnInit(): void {
        this.addJobNumIfy.form.get('B0604').valueChanges.subscribe(async val => {
            if (val) {
                await this.getFields();
                this.getHitoryRecord();
            }
        });
        this.addJobNumIfy.form.get('B0605').valueChanges.subscribe(async val => {
            if (val && this.addJobNumIfy.current === null) {
                await this.getFields();
                this.getHitoryRecord();
            }
        });

        this.addJobNumIfy.form.get('B0606').valueChanges.subscribe(val => {
            this.addJobNumIfy.isTC = val === '04';
        });
    }

    /** 下拉列表 */
    loadSelectOption() {
        const param = {};
        param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
        this.service.getOptionList(param).subscribe(res => {
            const { FALB, GWLB } = res;
            this.headerIfy.B0604_list = FALB.map(x => ({
                ...x,
                label: x.B0604_CN,
                value: x.B0604,
            }));
            this.headerIfy.B0605_list = GWLB.map(x => ({
                ...x,
                label: x.B0605_CN,
                value: x.B0605,
            }));
        });
    }

    /** 根据方案类别跟岗位类别获取记录 */
    getHitoryRecord() {
        if (this.addJobNumIfy.current) {
            return;
        }
        const { B0604, B0605 } = this.addJobNumIfy.form.getRawValue();
        const param = {
            B0604,
            B0605,
        };
        param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
        this.service.getRecord(param).subscribe(res => {
            if (res) {
                this.addJobNumIfy.form.patchValue({ ...res, B0604, B0605 }, { emitEvent: false });
                this.zh_CN = res;
                this.addJobNumIfy.old_entity = res;
            } else {
                this.addJobNumIfy.form.patchValue({ B0604, B0605 }, { emitEvent: false });
            }
        });
    }

    /**
     * 获取界面方案,并构造表单
     */
    async getFields() {
        const _loading = this.loading.show();
        const scheme = await this.getSchemeContent();
        this.render(scheme, this.addJobNumIfy.fields, this.addJobNumIfy.form);
        _loading.close();
    }
    /**
     * 取界面方案字段
     */
    private async getSchemeContent() {
        // 删除上一次的字段
        if (this.addJobNumIfy.fields.length > 0) {
            for (const item of this.addJobNumIfy.fields) {
                this.addJobNumIfy.form.removeControl(item.TABLE_COLUMN_CODE);
            }
            this.addJobNumIfy.fields = [];
        }
        const { B0604, B0605 } = this.addJobNumIfy.form.getRawValue();
        let scheme = 'job_management_01';
        if (B0604 === '0101' && B0605 === '01') {
            scheme = 'job_management_01';
        } else if (B0604 === '0102' && B0605 === '01') {
            scheme = 'job_management_02';
        } else if (B0604 === '0103' && B0605 === '01') {
            scheme = 'job_management_03';
        } else if (B0604 === '0104' && B0605 === '01') {
            scheme = 'job_management_04';
        } else if (B0604 === '0105' && B0605 === '01') {
            scheme = 'job_management_05';
        } else if (B0604 === '0106' && B0605 === '01') {
            scheme = 'job_management_06';
        } else if (B0604 === '0107' && B0605 === '01') {
            scheme = 'job_management_07';
        } else if (B0604 === '0108' && B0605 === '01') {
            scheme = 'job_management_08';
        } else if (B0604 === '0109' && B0605 === '01') {
            scheme = 'job_management_09';
        } else if (B0604 === '0110' && B0605 === '01') {
            scheme = 'job_management_10';
        } else if (B0604 === '0201' && B0605 === '02') {
            scheme = 'job_management_11';
        } else if (B0604 === '0202' && B0605 === '02') {
            scheme = 'job_management_12';
        } else if (B0604 === '0203' && B0605 === '02') {
            scheme = 'job_management_13';
        } else if (B0604 === '0301' && B0605 === '03') {
            scheme = 'job_management_14';
        } else if (B0604 === '0302' && B0605 === '03') {
            scheme = 'job_management_15';
        } else if (B0604 === '0303' && B0605 === '03') {
            scheme = 'job_management_16';
        }
        return await this.commonService.getFieldSchemeConent(scheme).toPromise();
    }

    /**
     * 根据界面方案构建表单
     * @param scheme 界面方案
     * @param fields 字段数组
     */
    private render(scheme: any, fields: Array<any>, form: FormGroup) {
        scheme.systemSchemeEdit.forEach(field => {
            form.addControl(
                field.TABLE_COLUMN_CODE,
                new FormControl(
                    { value: null, disabled: field.SCHEME_EDIT_IS_READONLY },
                    [
                        field.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                        field.SCHEME_EDIT_CHECK_SCRIPT
                            ? this.commonService.buildValidatorsFn(
                                  field,
                                  field.SCHEME_EDIT_CHECK_SCRIPT
                              )
                            : null,
                    ].filter(s => s)
                )
            );
            fields.push(field);
        });
    }

    formVerify(form: FormGroup): boolean {
        for (const i in form.controls) {
            form.controls[i].markAsDirty();
            form.controls[i].updateValueAndValidity({ emitEvent: false });
        }
        // 表单验证状态
        if (form.status !== 'VALID') {
            return false;
        }
        return true;
    }

    /** 获取记录职数 */
    getCountNum(item): number {
        let num = 0;
        const filterArr = [
            'B0607',
            'B0608',
            'B0609',
            'B0610',
            'B0611',
            'DATA_3001_UNIT_B06_B01_ID',
            'DATA_3001_UNIT_B06_ID',
            'ROWNUM_',
            'SYS_SORT',
            'SYS_STATUS',
        ];
        for (const key in item) {
            if (typeof item[key] === 'number' && !filterArr.includes(key)) {
                num += parseInt(item[key]) || 0;
            }
        }
        return num;
    }

    /** 获取编制总数 */
    getBzNum(item, ...args) {
        let num = 0;
        args.forEach(x => {
            num += parseInt(item[x]) || 0;
        });
        return num;
    }
}
