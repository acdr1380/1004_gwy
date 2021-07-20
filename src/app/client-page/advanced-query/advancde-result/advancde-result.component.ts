import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AdvancedQueryService } from '../advanced-query.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Base64 } from 'js-base64';
import { CommonService } from 'app/util/common.service';
import { ParameterType } from '../enums/Parameter-type.enum';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ClientService } from 'app/master-page/client/client.service';
@Component({
    selector: 'app-advancde-result',
    templateUrl: './advancde-result.component.html',
    styleUrls: ['./advancde-result.component.scss'],
})
export class AdvancdeResultComponent implements OnInit, AfterViewInit {
    constructor(
        private clientService: ClientService,
        private activeRoute: ActivatedRoute,
        private service: AdvancedQueryService,
        private message: NzMessageService,
        private router: Router,
        private comm: CommonService,
        private cdr: ChangeDetectorRef
    ) {}

    @ViewChild('tableParent', { static: false }) private tableParentEl: ElementRef;

    /**
     * 查询条件
     */
    whereCondition = <any>{};

    where_zh_CN: Array<any> = [];

    /**
     * 查询数据显示表格
     */
    selectResultTbl = {
        visible: false,
        loading: false,
        pageIndex: 1,
        pageSize: 20,
        BufferPx: 500,
        scroll: { x: '1200px', y: '500px' },
        total: 0,
        fields: [],
        data: [],
        /**
         * 页码发生改变时回调
         */
        pageIndexChange: () => {
            this.selectPsnList(this.whereCondition);
        },
        /**
         * 页码大小改变
         */
        pageSizeChange: () => {
            this.selectPsnList(this.whereCondition);
        },
        evtDbClick: data => {
            globalThis.event.preventDefault();
            const GL = Base64.encode(
                JSON.stringify({
                    ID: data.DATA_PERSON_A01_ID,
                })
            );
            // this.router.navigate(['personal-details', { GL }], { relativeTo: this.activatedRoute });
            const url = `irregularity/form-page;GL=${GL}`;

            window.winOperSalaryInfoDlg = window.open(url, 'salary-Info');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
        },
    };

    /**显示字段调整 */
    fieldAdjustDrw = {
        visible: false,
        title: '显示字段调整',
        width: 800,
        open: () => {
            this.comm.getSchemeContent('advancdeShowfield').subscribe(result => {
                if (result) {
                    const nodes = [];
                    this.buildFieldsTreeData(result, nodes);
                    this.fieldAdjustDrw.adjustTree.nodes = nodes;
                    this.fieldAdjustDrw.visible = true;
                }
            });
        },
        close: () => {
            this.fieldAdjustDrw.visible = false;
        },

        adjustTree: {
            nodes: [],
            icons: ['tags', 'shield'],
            activedNode: null,
            evtActiveNode: data => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldAdjustDrw.adjustTree.activedNode = data.node;
                }
            },
            evtDblActiveNode: data => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldAdjustDrw.adjustTree.activedNode = data.node;
                    this.fieldAdjustDrw.evtChoose();
                }
            },
        },
        evtChoose: () => {
            if (!this.fieldAdjustDrw.adjustTree.activedNode.key) {
                return;
            }

            const { origin } = this.fieldAdjustDrw.adjustTree.activedNode;
            const index = this.fieldAdjustDrw.selectedIfy.list.findIndex(v => v.key === origin.key);
            if (index === -1) {
                this.fieldAdjustDrw.selectedIfy.list.push(origin);
            }
        },

        selectedIfy: {
            list: <any>[],
            drop: (event: CdkDragDrop<any[]>) => {
                if (event.previousIndex === event.currentIndex) {
                    return;
                }
                moveItemInArray(
                    this.fieldAdjustDrw.selectedIfy.list,
                    event.previousIndex,
                    event.currentIndex
                );
            },

            delete: (item, index: number) => {
                this.fieldAdjustDrw.selectedIfy.list.splice(index, 1);
            },
        },

        save: () => {
            if (this.fieldAdjustDrw.selectedIfy.list.length === 0) {
                this.message.warning('未选择显示字段。');
                return;
            }
            const userInfo = this.comm.getUserLoginInfo();
            const data = {
                USER_PARAMETER_USER_ID: userInfo.sessionUser.userId,
                USER_PARAMETER_NAME: '高级查询显示字段',
                USER_PARAMETER_TYPE: ParameterType.SENIOR_QUERY_VIEW_FIELD,
                USER_PARAMETER_VALUE: this.fieldAdjustDrw.selectedIfy.list
                    .map(v => v.TABLE_COLUMN_CODE)
                    .join(','),
            };
            this.service.saveParameterData(data).subscribe(result => {
                if (result) {
                    this.message.success('调整成功!');
                    this.fieldAdjustDrw.close();
                    this.loadUserFields();
                }
            });
        },
    };

    /**
     * 保存条件抽屉
     */
    conditionDrawer = {
        visible: false,
        title: '保存条件',
        width: 300,
        btnloading: false,
        open: () => {
            this.conditionDrawer.visible = true;
        },
        close: () => {
            this.conditionDrawer.visible = false;
        },
        /**
         * 保存条件表单
         */
        form: new FormGroup({
            QUERY_HISTORY_NAME: new FormControl(null, Validators.required),
        }),
        /**
         * 保存查询条件
         */
        evtSaveWhere: () => {
            const name = this.conditionDrawer.form.getRawValue().QUERY_HISTORY_NAME;
            this.conditionDrawer.btnloading = true;
            this.service
                .saveWhere({
                    QUERY_HISTORY_NAME: name,
                    QUERY_HISTORY_CONTENT: this.whereCondition,
                    QUERY_HISTORY_FIELD_NAME: this.where_zh_CN,
                })
                .subscribe(json => {
                    this.conditionDrawer.btnloading = false;
                    if (json.code !== 0) {
                        return false;
                    }
                    this.conditionDrawer.close();
                });
            // this.modalService.confirm({
            //     nzTitle: '系统提示?',
            //     nzContent: `<b style="color: #ffac38;">是否另存为主题查询？</b>`,
            //     nzOkText: '是',
            //     nzOkType: 'primary',
            //     nzOnOk: () => {
            //     },
            //     nzCancelText: '否',
            //     nzOnCancel: () => {
            //         this.conditionDrawer.btnloading = true;
            //         this.service
            //             .saveWhere({
            //                 QUERY_HISTORY_NAME: name,
            //                 QUERY_HISTORY_CONTENT: where,
            //                 QUERY_HISTORY_FIELD_NAME: this.where_zh_CN,
            //             })
            //             .subscribe(json => {
            //                 this.conditionDrawer.btnloading = false;
            //                 if (json.code !== 0) {
            //                     return false;
            //                 }
            //                 this.conditionDrawer.close();
            //             });
            //     },
            // });
        },
    };
    ngOnInit() {
        fromEvent(window, 'resize').subscribe(() => {
            this.ngAfterViewInit();
        });
        // 面包屑导航
        this.clientService.buildBreadCrumb([
            {
                text: '返回查询',
                type: 'event',
                icon: 'left',
                link: 'client/advanced-query',
                event: () => {
                    this.whereCondition.where_zh_CN = this.where_zh_CN;
                    this.router.navigate([
                        'client/advanced-query',
                        { GL: Base64.encode(JSON.stringify(this.whereCondition)) },
                    ]);
                },
            },
            {
                type: 'text',
                text: '查询结果',
            },
        ]);

        /**
         * 获取路由参数，并查询人员
         */
        this.activeRoute.paramMap.subscribe((params: ParamMap) => {
            if (params.has('GL')) {
                const obj = JSON.parse(Base64.decode(params.get('GL')));
                this.whereCondition = obj.QUERY_HISTORY_CONTENT || obj;
                this.where_zh_CN = obj.where_zh_CN || obj.QUERY_HISTORY_FIELD_NAME;
                // delete this.whereCondition.where_zh_CN;
                // this.selectPsnList(this.whereCondition);
                this.loadUserFields();
            } else {
                this.message.error('没有获取到参数！');
            }
        });
    }

    ngAfterViewInit() {
        const el = this.tableParentEl.nativeElement;
        this.selectResultTbl.BufferPx = el.offsetHeight - 40 - 20 - 50; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        this.selectResultTbl.scroll.y = `${this.selectResultTbl.BufferPx}px`;
        this.selectResultTbl.scroll.x = `${this.selectResultTbl.fields.length * 150}px`;
        this.selectResultTbl.scroll = { ...this.selectResultTbl.scroll };
        this.cdr.detectChanges();
    }

    /**
     * 查询人员
     * @param data 查询条件
     */
    selectPsnList(data: any) {
        // 计算表格宽度
        this.ngAfterViewInit();
        const formWhere = JSON.parse(JSON.stringify(data));
        formWhere.$PAGE_SIZE$ = this.selectResultTbl.pageSize;
        formWhere.$PAGE_INDEX$ = this.selectResultTbl.pageIndex;
        this.selectResultTbl.loading = true;
        // 特殊处理年龄
        if (formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.findIndex(x => x.FIELD === 'E0141') > -1) {
            const startAge = formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.find(
                x => x.FIELD === 'startAge'
            ).VALUE;
            formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.splice(
                formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.findIndex(x => x.FIELD === 'startAge'),
                1
            );
            const endAge = formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.find(
                x => x.FIELD === 'endAge'
            ).VALUE;
            formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.splice(
                formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.findIndex(x => x.FIELD === 'endAge'),
                1
            );
            const endTime = data.QUERY_WHERE_LIST.DATA_PERSON_A01.find(x => x.FIELD === 'E0141')
                .VALUE;
            formWhere.QUERY_WHERE_LIST.DATA_PERSON_A01.find(x => x.FIELD === 'E0141').VALUE = [
                startAge,
                endAge,
                endTime,
            ];
        }
        this.service.getQueryResult(formWhere).subscribe(json => {
            this.selectResultTbl.loading = false;
            if (json.code !== 0) {
                return;
            }
            if (this.selectResultTbl.pageIndex === 1) {
                this.selectResultTbl.total = json.data.totalCount;
            }
            this.selectResultTbl.data = json.data.result;
        });
    }

    /**
     * 根据界面方案字段构造树形结构
     *
     * @param {any} data 界面方案
     * @param {any[]} nodes 树
     * @memberof PersonmgrComponent
     */
    buildFieldsTreeData(data: any, nodes: any[]) {
        data.systemSchemeList.forEach(item => {
            const node = {
                title: item.systemSchemeTable.TABLE_NAME,
                key: item.systemSchemeTable.SCHEME_TABLE_TABLE_ID,
                isLeaf: item.systemSchemeEdit.length === 0,
                children: [],
                nodeType: 0,
            };

            item.systemSchemeEdit.forEach(field => {
                node.children.push({
                    ...field,
                    title: field.TABLE_COLUMN_NAME,
                    key: field.TABLE_COLUMN_CODE,
                    isLeaf: true,
                    nodeType: 1,
                });
            });
            nodes.push(node);
        });
    }

    /**
     * 获取用户保存字段
     */
    loadUserFields() {
        const userInfo = this.comm.getUserLoginInfo();
        this.service
            .getParameterData(userInfo.userId, ParameterType.SENIOR_QUERY_VIEW_FIELD)
            .subscribe(json => {
                if (json.length > 0) {
                    const itemIds = json.map(x => x.TABLE_COLUMN_CODE);
                    this.comm.getSchemeContent('advancdeShowfield').subscribe(result => {
                        if (result) {
                            this.fieldAdjustDrw.selectedIfy.list = this.getChemeSetItemInfo(
                                result,
                                // itemIds.split(',')
                                itemIds
                            );
                            this.selectResultTbl.fields = this.fieldAdjustDrw.selectedIfy.list;
                            const arr = [];
                            this.selectResultTbl.fields.forEach(v => {
                                if (v) {
                                    arr.push(v);
                                }
                            });
                            this.selectResultTbl.fields = [...arr];
                            this.selectPsnList(this.whereCondition);
                        }
                    });
                } else {
                    this.service
                        .getSetItems([
                            'A0101',
                            'A0104',
                            'A0184',
                            'A0117',
                            'A0107',
                            'A0111',
                            'A0141',
                        ])
                        .then(fields => {
                            if (fields) {
                                this.selectResultTbl.fields = fields.map(v => ({
                                    ...v,
                                }));
                                this.selectPsnList(this.whereCondition);
                            }
                        });
                }
            });
    }

    getChemeSetItemInfo(data: any, fields: any[]) {
        const fieldsInfo = Array(fields.length).fill(null);
        const fieldArrs = [];
        data.systemSchemeList.forEach(item => {
            item.systemSchemeEdit.forEach(field => {
                if (fields.indexOf(field.TABLE_COLUMN_CODE) > -1) {
                    fieldsInfo.splice(fields.indexOf(field.TABLE_COLUMN_CODE), 1, field);
                }
            });
        });
        fieldsInfo.map((_f, index) => {
            if (_f !== null) {
                fieldArrs.push(_f);
            }
        });
        return fieldArrs;
    }
}
