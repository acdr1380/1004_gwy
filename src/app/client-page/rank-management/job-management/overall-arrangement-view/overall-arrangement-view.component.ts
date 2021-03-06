import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'app/components/loading/loading.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { JobManagementService } from '../job-management.service';

@Component({
    selector: 'gl-overall-arrangement-view',
    templateUrl: './overall-arrangement-view.component.html',
    styleUrls: ['./overall-arrangement-view.component.scss'],
})
export class OverallArrangementViewComponent implements OnInit {
    /** 当前选中的机构节点 */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
            this.overallIfy.loadRows();
        }
    }
    get node() {
        return this._node;
    }

    zh_CN = <any>{};

    tableId = this.tableHeleper.getTableCode('B06A');

    /** 统筹设置表格 */
    overallIfy = {
        rows: [],
        pageSize: 10,
        pageIndex: 1,
        total: 0,
        loading: false,
        sizeOption: [10, 15, 20, 25, 30],
        loadRows: () => {
            const param = {};
            param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;
            this.overallIfy.loading = true;
            this.service.getOverallDate(param).subscribe(res => {
                this.overallIfy.loading = false;

                this.overallIfy.rows = res;
                // this.overallIfy.rows = res.result;
                // if (res.pageIndex === 1) {
                //     this.overallIfy.total = res.totalCount;
                // }
            });
        },
        remove: item => {
            const param = {};
            param[this.tableId + '_ID'] = item[this.tableId + '_ID'];
            const _loading = this.loading.show();
            this.service.postDeleteOverall(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    const index = this.overallIfy.rows.findIndex(
                        x => x[this.tableId + '_ID'] === item[this.tableId + '_ID']
                    );

                    this.overallIfy.rows.splice(index, 1);
                    this.overallIfy.rows = [...this.overallIfy.rows];
                }
            });
        },
    };

    /** 统筹信息抽屉 */
    overallMsgIfy = {
        visible: false,
        width: 400,
        current: null,
        open: async (item = null) => {
            if (!this.node) {
                this.message.warning('请先选择单位！');
                return;
            }
            if (this.overallMsgIfy.fields.length === 0) {
                await this.getFields();
            }

            if (item) {
                this.overallMsgIfy.current = item;
                this.overallMsgIfy.form.reset(item);
                this.zh_CN = item;
            }
            this.overallMsgIfy.visible = true;
        },
        close: () => {
            this.overallMsgIfy.form.reset();
            this.overallMsgIfy.current = null;
            this.overallMsgIfy.visible = false;
        },
        form: new FormGroup({}),
        fields: [],

        save: () => {
            this.overallMsgIfy.current ? this.overallMsgIfy.update() : this.overallMsgIfy.add();
        },
        add: () => {
            if (!this.commonService.formVerify(this.overallMsgIfy.form)) {
                return;
            }
            const param = {
                ...this.overallMsgIfy.form.getRawValue(),
            };
            param[this.tableId + '_B01_ID'] = this.node.origin.ORG_B01_ID;

            const _loading = this.loading.show();
            this.service.postInsertOverall(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    this.overallIfy.rows = [
                        ...this.overallIfy.rows.map(x => ({ ...x, IS_LAST_ROW: false })),
                        res.data,
                    ];

                    this.overallMsgIfy.close();
                }
            });
        },
        update: () => {
            if (!this.commonService.formVerify(this.overallMsgIfy.form)) {
                return;
            }
            const param = {
                ...this.overallMsgIfy.form.getRawValue(),
            };
            param[this.tableId + '_ID'] = this.overallMsgIfy.current[this.tableId + '_ID'];

            const _loading = this.loading.show();
            this.service.postUpdateOverall(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    const index = this.overallIfy.rows.findIndex(
                        x =>
                            x[this.tableId + '_ID'] ===
                            this.overallMsgIfy.current[this.tableId + '_ID']
                    );
                    this.overallIfy.rows[index] = res.data;
                    this.overallIfy.rows = [...this.overallIfy.rows];
                    this.overallMsgIfy.close();
                }
            });
        },
    };

    /** 使用情况抽屉 */
    useSituationIfy = {
        visible: false,
        title: '统筹使用情况',
        width: 600,
        current: null,
        open: item => {
            this.useSituationIfy.current = item;
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
                const params = {
                    B06B01: this.useSituationIfy.current[this.tableHeleper.getTableCode('B06A')+'_ID']
                };
                this.service.getCheckList(params).subscribe(json => {
                    this.useSituationIfy.table.rows = json;
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

    /**
     * 获取界面方案,并构造表单
     */
    async getFields() {
        const _loading = this.loading.show();
        const scheme = await this.getSchemeContent();
        this.render(scheme, this.overallMsgIfy.fields, this.overallMsgIfy.form);
        _loading.close();
    }

    /**
     * 取界面方案字段
     */
    private async getSchemeContent() {
        let scheme = 'overall_set_01';
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
}
