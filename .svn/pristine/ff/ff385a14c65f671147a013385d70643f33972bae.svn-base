import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonService } from 'app/util/common.service';
import * as _ from 'lodash';
import {
    NzFormatEmitEvent,
    NzTreeComponent,
    NzTreeNode,
    NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { OperatorEnum, OperatorEnum_EN } from './enums/OperatorEnum';
import { ClientService } from 'app/master-page/client/client.service';
import { AdvancedSearchService } from './advanced-search.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Base64 } from 'js-base64';

@Component({
    selector: 'gl-advanced-search',
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
    // 高级查询对照类型——中文
    operatorEnumList = OperatorEnum_EN;
    operatorEnum = OperatorEnum;
    permisson = 'advanced-query-1004';

    /**
     * 转换高级查询类型中文
     */
    transOperatorEnumEN = value => {
        const item = this.operatorEnumList.find(v => v.value === value);
        return item && item.text;
    };

    /**
     * 用户信息
     */
    userInfo: any;

    /**
     * 调整表格字段显示
     */
    fieldsAdjust = {
        title: '显示字段调整',
        visible: false,
        width: 800,
        close: () => (this.fieldsAdjust.visible = false),
        open: () => (this.fieldsAdjust.visible = true),

        searchValue: null,
        // 备选字段
        alternativeTree: {
            nodes: [] as NzTreeNodeOptions[],
            icons: ['tags', 'shield'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldsAdjust.alternativeTree.activedNode = data.node;
                }
            },
            // 双击
            evtDblActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldsAdjust.alternativeTree.activedNode = data.node;
                    this.fieldsAdjust.evtChoose();
                }
            },
        },
        // 选择指定指标
        evtChoose: () => {
            if (!this.fieldsAdjust.alternativeTree.activedNode.key) {
                return;
            }

            const { origin } = this.fieldsAdjust.alternativeTree.activedNode;
            const index = this.fieldsAdjust.selectedIfy.list.findIndex(
                v => v.TABLE_COLUMN_CODE === origin.TABLE_COLUMN_CODE
            );
            if (index === -1) {
                // 已选指标中不存在选中指标时
                const a2503_index = this.fieldsAdjust.selectedIfy.list.findIndex(
                    v => v.TABLE_COLUMN_CODE === 'A2503'
                );
                const a2502_index = this.fieldsAdjust.selectedIfy.list.findIndex(
                    v => v.TABLE_COLUMN_CODE === 'A2502'
                );
                if (Math.min(a2503_index, a2502_index) > -1) {
                    this.fieldsAdjust.selectedIfy.list.splice(
                        Math.min(a2503_index, a2502_index),
                        0,
                        origin
                    );
                } else {
                    this.fieldsAdjust.selectedIfy.list.push(origin);
                }
            }
        },

        // 移动已选指标字段位置
        selectedIfy: {
            // 默认选择字段 在调整顺序以及选择字段还有保存字段的时候处理
            defaultFilelds: [],
            list: <any>[],
            drop: (event: CdkDragDrop<any[]>) => {
                if (event.currentIndex >= this.fieldsAdjust.selectedIfy.list.length - 2) {
                    this.message.warning('不能移动在固定字段后面。');
                    return;
                }
                if (event.previousIndex === event.currentIndex) {
                    return;
                }
                moveItemInArray(
                    this.fieldsAdjust.selectedIfy.list,
                    event.previousIndex,
                    event.currentIndex
                );
            },
            // 删除已选指标字段
            delete: (item, index: number) => {
                this.fieldsAdjust.selectedIfy.list.splice(index, 1);
            },
        },
        // 完成指标调整
        save: () => {
            if (this.fieldsAdjust.selectedIfy.list.length === 0) {
                this.message.warning('未选择显示字段。');
                return;
            }
            const userInfo = this.userInfo;
            let _paramValue = this.fieldsAdjust.selectedIfy.list.map(v => v.TABLE_COLUMN_CODE);
            _paramValue = _.uniq([..._paramValue, ...this.fieldsAdjust.selectedIfy.defaultFilelds]);
            const data = {
                USER_PARAMETER_USER_ID: userInfo.authId,
                USER_PARAMETER_NAME: '高级查询-显示字段调整',
                USER_PARAMETER_TYPE: UserParameterTypeEnum.SENIOR_QUERY_VIEW_FIELD,
                USER_PARAMETER_VALUE: _paramValue.join(','),
            };
            this.service.saveParameterData(data).subscribe(result => {
                if (result) {
                    this.message.success('调整成功。');
                    this.queryTable.Fields = this.fieldsAdjust.selectedIfy.list.map(v => {
                        return {
                            ...v,
                            tableId: v.TABLE_COLUMN_CODE.slice(0, 3),
                        };
                    });
                    // 表格重新取数
                    this.queryStart();
                    this.fieldsAdjust.close();
                }
            });
        },
    };
    @ViewChild('scrollQueryCondition', { static: false })
    private scrollQueryCondition: CdkVirtualScrollViewport;

    /**
     * 查询返回的表格内容
     */
    queryTable = {
        data: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize: 5,
        Fields: [],
        nzLoading: false,
        // 查询字符串
        queryKey: '',
        /**
         * 解析查询内容
         */
        queryResult: [],
        switch: true,
        evtSwith: () => (this.queryTable.switch = !this.queryTable.switch),
        /**
         * 构造查询字段条件
         */
        conditionFieldIds: [],
        evtSelectConditionItem: field => {
            const index = this.queryTable.conditionFieldIds.findIndex(
                item => item.TABLE_COLUMN_CODE === field.TABLE_COLUMN_CODE
            );
            this.scrollQueryCondition.scrollToIndex(index);
        },

        list: [],
        isCheckAll: false,
        isIndeterminate: false,
        evtCheckAll: (value: boolean) => {
            this.queryTable.data.forEach(
                item => (this.queryTable.mapOfCheckedId[item.keyId] = value)
            );
            this.queryTable.evtRowCheckedChange();
        },
        mapOfCheckedId: <any>{},
        evtRowCheckedChange: () => {
            this.queryTable.isCheckAll =
                this.queryTable.data.every(item => this.queryTable.mapOfCheckedId[item.keyId]) &&
                this.queryTable.data.length > 0;
            this.queryTable.isIndeterminate =
                this.queryTable.data.some(item => this.queryTable.mapOfCheckedId[item.keyId]) &&
                !this.queryTable.isCheckAll;

            this.queryTable.list = [
                ...this.queryTable.list.filter(item => this.queryTable.mapOfCheckedId[item.keyId]),
                ...this.queryTable._getCheckedList(),
            ];
        },
        _getCheckedList: () => {
            return this.queryTable.data
                .filter(item => {
                    return (
                        this.queryTable.mapOfCheckedId[item.keyId] &&
                        this.queryTable.list.findIndex(v => v.keyId === item.keyId) === -1
                    );
                })
                .map(item => ({ A0101: item.a0101, keyId: item.keyId }));
        },
        _setTableCheck: () => {
            this.queryTable.isCheckAll =
                this.queryTable.data.every(
                    item => this.queryTable.list.findIndex(v => v.keyId === item.keyId) > -1
                ) && this.queryTable.data.length > 0;
            this.queryTable.isIndeterminate =
                this.queryTable.data.some(
                    item => this.queryTable.list.findIndex(v => v.keyId === item.keyId) > -1
                ) && !this.queryTable.isCheckAll;
        },

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
        /**
         * 删除已选条件
         */
        deleteQueryCondition: field => {
            field.selectedQuery = false;
        },
    };

    @ViewChild('conditionFieldsTree', { static: false })
    private conditionFieldsTree: NzTreeComponent;
    /**
     * 选择查询字段抽屉，添加条件
     */
    selectorFieldsIfy = {
        title: '选择查询字段',
        visible: false,
        width: 350,
        close: () => (this.selectorFieldsIfy.visible = false),
        open: () => (this.selectorFieldsIfy.visible = true),
        // 字段搜索
        find: {
            list: [],
            keyword: null,
            evtOpenChange: () => { },
            evtOnSearch: (keyword: string) => {
                if (keyword) {
                }
            },
            evtChange: () => { },
        },
        searchValue: null,
        tree: {
            nodes: [],
            icons: ['tags', 'shield'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.selectorFieldsIfy.tree.activedNode = data.node;
                }
            },
        },
        // 确认选择字段
        evtSelected: () => {
            const list = this.conditionFieldsTree.getCheckedNodeList();
            // list.forEach(node => this.conditionFieldIds.push(<any>node.origin));
            list.forEach(node => {
                const len = this.queryTable.conditionFieldIds.filter(
                    v => v.TABLE_COLUMN_CODE === node.key
                ).length;
                if (len === 0) {
                    this.queryTable.conditionFieldIds.push(<any>node.origin);
                }
            });

            this.queryTable.conditionFieldIds.forEach(v => {
                v.operator = 0;
                v.selectedQuery = true;
            });
            this.selectorFieldsIfy.close();
        },
        // 删除复选框条件项
        delFields: field => {
            const index = this.queryTable.conditionFieldIds.findIndex(
                item => item.TABLE_COLUMN_CODE === field.TABLE_COLUMN_CODE
            );
            if (index !== -1) {
                this.queryTable.conditionFieldIds.splice(index, 1);
            }
        },
    };

    /**
     * 保存字段条件
     */
    saveCondition = <any>{
        visible: false,
        name: null,
        form: new FormGroup({
            name: new FormControl(null),
        }),
        open: () => (this.saveCondition.visible = true),
        close: () => (this.saveCondition.visible = false),
        save: () => {
            if (this._getQueryWhereList().length === 0) {
                this.message.warning('请先选择所要保存的条件!');
                return;
            }
            this.saveCondition.open();
        },
        // 保存条件
        saveCondition: () => {
            const data = {
                QUERY_HISTORY_NAME: this.saveCondition.form.value.name,
                QUERY_HISTORY_CONTENT: this._getQueryWhereList(),
            };
            this.service.saveCondition(data).subscribe(() => {
                this.message.success('保存成功!');
                this.saveCondition.close();
            });
        },
    };

    /**
     * 已存条件
     */
    existCondition = {
        visible: false,
        tableData: [],
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        open: () => (this.existCondition.visible = true),
        close: () => (this.existCondition.visible = false),
        // 查询已存条件
        evtHaveExist: () => {
            const data = {
                pageIndex: this.existCondition.pageIndex,
                pageSize: this.existCondition.pageSize,
                userParameterTypeEnum: UserParameterTypeEnum.SENIOR_QUERY_VIEW_FIELD,
            };
            this.service.selectCondition(data).subscribe(result => {
                this.existCondition.tableData = result.result;
                if (this.existCondition.totalCount === 0) {
                    this.existCondition.totalCount = result.totalCount;
                }
            });
            this.existCondition.open();
        },
        // 删除已存条件
        deleteCondition: item => {
            this.service.deleteCondition(item.SYS_USER_QUERY_HISTORY_ID).subscribe(() => {
                this.message.success('删除成功!');
                const index = this.existCondition.tableData.findIndex(
                    v => v.SYS_USER_QUERY_HISTORY_ID === item.SYS_USER_QUERY_HISTORY_ID
                );
                this.existCondition.tableData.splice(index, 1);
                this.existCondition.tableData = [...this.existCondition.tableData];
                this.existCondition.totalCount -= 1;
            });
        },
        // 已存条件查询
        query: item => {
            const list = item.QUERY_HISTORY_CONTENT.map(v => {
                const [item, item2] = v.query;
                const data = {
                    ...v,
                    TABLE_COLUMN_NAME: v.itemName,
                    SCHEME_HEADER_DISPLAY_NAME: v.itemName,
                    TABLE_COLUMN_TYPE: v.type,
                    TABLE_COLUMN_DICTIONARY_CODE: v.codeId,
                    TABLE_COLUMN_CODE: v.fieldId,
                    selectedQuery: true,
                    value: item.value,
                    value2: item2.value,
                };
                return data;
            });
            this.queryTable.conditionFieldIds = list;
            // 表格取数
            this.queryStart();
            this.existCondition.close();
        },
    };

    // 最新数据-原始数据
    oldAndNewData = {
        /**
         * 数据状态
         */
        isNewOrOldStatus: 0,
        checkOptionsOne: [
            { label: '最新数据', value: 0 },
            { label: '原始数据', value: 1 },
        ],
        NewOrOldData: () => {
            this.queryStart(true);
        },
    };

    /**
     * excel导出
     */
    documentOutputIfy = {
        downloadLRMX: () => {
            if (this.queryTable.list.length === 0) {
                this.message.warning('请先勾选需要导出文件的人员。');
                return;
            }
            const params = {
                DATA_3001_PERSON_A01_IDS: this.queryTable.list.map(p => p.keyId)
            };
            this.commonService.downFilePost(
                'api/gl-service-data-civil/v1/data/person/a01/downloadLrmx',
                params
            );
        },
    };

    constructor(
        private commonService: CommonService,
        private clientService: ClientService,
        private service: AdvancedSearchService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) { }

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
        this.loadUserFields();

        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                icon: 'home',
                link: '/client/index',
                type: 'home',
            },
            { type: 'text', text: '高级查询' },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 回车事件
     * @param param0 键盘按键
     */
    eventKeyDown({ keyCode }) {
        if (keyCode === 13) {
            this.staffSearch();
        }
    }

    evtDateBetweenChange(data, field) {
        const [value, value2] = data;
        field.value = value;
        field.value2 = value2;
    }

    /**
     * 解析查询内容
     * @param isRefParmas 是否刷新参数
     */
    staffSearch() {
        if (!this.queryTable.queryKey) {
            return;
        }
        this.service.getExpression(this.queryTable.queryKey).subscribe(result => {
            if (result) {
                this.queryTable.queryResult = result;
                this.buildCondition();
            }
        });
        // if (isRefParmas) {
        //     const queryKey = Base64.encode(this.queryKey);
        //     // this.router.navigate([`specific`, { Q: queryKey }], {
        //     //     relativeTo: this.activatedRoute.parent,
        //     // });
        // } else {
        //     this.service.getExpression(this.queryKey).subscribe(result => {
        //         if (result) {
        //             this.queryTable.queryResult = result;
        //             this.buildCondition();
        //         }
        //     });
        // }
    }

    /**
     * 构造条件
     */
    buildCondition() {
        const itemIds = this.queryTable.queryResult.map(v => v.fieldId);
        this.service.getSetItems(itemIds).then(fieldIds => {
            if (fieldIds) {
                this.queryTable.conditionFieldIds = fieldIds.map(v => {
                    const seniorItem = this.queryTable.queryResult.find(
                        w => w.fieldId === v.TABLE_COLUMN_CODE
                    );
                    return {
                        ...v,
                        operator: seniorItem.operator,
                        value: seniorItem.value,
                        selectedQuery: true,
                    };
                });
            }
        });
    }

    /**
     * 表格数据加载
     * @param reset 是否重置分页
     */
    queryStart(reset: boolean = false): void {
        if (reset) {
            this.queryTable.pageIndex = 1;
        }
        const params = {
            pageIndex: this.queryTable.pageIndex,
            pageSize: this.queryTable.pageSize,
            userParameterTypeEnum: UserParameterTypeEnum.SENIOR_QUERY_VIEW_FIELD,
            recordCount: this.oldAndNewData.isNewOrOldStatus,
            queryWhereList: this._getQueryWhereList(),
        };

        if (params.queryWhereList.length === 0) {
            this.message.warning('请选择查询条件');
            return;
        }
        this.queryTable.nzLoading = true;
        this.queryTable.data = [];
        this.service.getQueryExecute(params).subscribe(data => {
            if (!data) {
                this.queryTable.data = [];
                this.queryTable.totalCount = 0;
                this.queryTable.nzLoading = false;
                return;
            }
            data.result = data.result.map(v => {
                return {
                    ...v,
                    keyId: v[`${this.tableHelper.getTableCode('A01')}_ID`],
                };
            });

            this.queryTable.nzLoading = false;
            if (data && data.result && data.result.length !== 0) {
                let rowSpan = 1;
                let rowIndex = 0;
                let lastKeyId = data.result[0].keyId;
                data.result.forEach((row, index) => {
                    if (rowIndex !== index && lastKeyId === row.keyId) {
                        data.result[index].isHide = true;
                        rowSpan++;
                        if (
                            rowIndex !== index &&
                            lastKeyId === row.keyId &&
                            index === data.result.length - 1
                        ) {
                            data.result[rowIndex].rowSpan = rowSpan;
                            rowSpan = 1;
                            rowIndex = index;
                            lastKeyId = row.keyId;
                        }
                    } else {
                        data.result[rowIndex].rowSpan = rowSpan;
                        rowSpan = 1;
                        rowIndex = index;
                        lastKeyId = row.keyId;
                    }
                });
                this.queryTable.data = data.result;
            }
            if (data.totalCount > 0) {
                this.queryTable.totalCount = data.totalCount;
            }
            this.queryTable._setTableCheck();
        });
    }

    /**
     * 构造查询条件
     */
    private _getQueryWhereList() {
        return this.queryTable.conditionFieldIds
            .filter(v => {
                // 把没值的条件排除
                v.selectedQuery = v.value || v.value2;
                return v.selectedQuery;
            })
            .map(v => {
                const data = {
                    itemName: v.TABLE_COLUMN_NAME,
                    fieldId: v.TABLE_COLUMN_CODE,
                    itemType: !v.TABLE_COLUMN_DICTIONARY_CODE ? 1 : 0,
                    type: v.TABLE_COLUMN_TYPE,
                    codeId: v.TABLE_COLUMN_DICTIONARY_CODE ? v.TABLE_COLUMN_DICTIONARY_CODE : null,
                    operator: v.operator,
                    query: [{ value: v.value }, { value: v.value2 }],
                    itemCodeText: v.itemCodeText,
                };
                return data;
            });
    }

    /**
     * 选择字段
     */
    evtSelectorFields() {
        if (this.selectorFieldsIfy.tree.nodes.length === 0) {
            this.service.getChemeContent(this.permisson).subscribe(result => {
                if (result) {
                    const nodes = [];
                    this.buildFieldsTreeData(result, nodes, 'systemSchemeEdit');
                    this.selectorFieldsIfy.tree.nodes = nodes;
                }
            });
        }
        this.selectorFieldsIfy.open();
    }

    /***
     * 获取用户自定义显示字段
     */
    loadUserFields() {
        const userInfo = this.userInfo;
        this.service
            .getParameterData({
                USER_PARAMETER_USER_ID: userInfo.authId,
                USER_PARAMETER_TYPE: UserParameterTypeEnum.SENIOR_QUERY_VIEW_FIELD,
            })
            .subscribe(data => {
                if (!!data && data.length !== 0) {
                    this.fieldsAdjust.selectedIfy.list = data;
                    const itemIds = data.map(x => x.TABLE_COLUMN_CODE);
                    this.service.getChemeContent(this.permisson).subscribe(result => {
                        if (result) {
                            this.fieldsAdjust.selectedIfy.list = this.getChemeSetItemInfo(
                                result,
                                itemIds
                            );
                            this.queryTable.Fields = this.fieldsAdjust.selectedIfy.list.map(v => {
                                return {
                                    ...v,
                                    tableId: v.TABLE_COLUMN_CODE.slice(0, 3),
                                };
                            });
                            const arr = [];
                            this.queryTable.Fields.forEach(v => {
                                if (v) {
                                    arr.push(v);
                                }
                            });
                            this.queryTable.Fields = [...arr];
                            this.fieldsAdjust.selectedIfy.list = arr;
                        }
                    });
                } else {
                    this.service
                        .selectByParameterCodes('SENIOR_QUERY_VIEW_FIELD')
                        .subscribe(fields => {
                            if (fields) {
                                this.queryTable.Fields = fields.map(v => ({
                                    ...v,
                                    SCHEME_HEADER_DISPLAY_NAME: v.TABLE_COLUMN_NAME,
                                    tableId: v.TABLE_COLUMN_CODE.slice(0, 3),
                                }));
                            }
                        });
                }
            });
    }

    getChemeSetItemInfo(data, fields: any[]): any[] {
        const fieldsInfo: Array<any> = [];
        data.systemSchemeList.forEach(item => {
            item.systemSchemeEdit.forEach(field => {
                if (fields.indexOf(field.TABLE_COLUMN_CODE) > -1) {
                    fieldsInfo.push(field);
                }
            });
        });
        return fieldsInfo;
    }

    /**
     * 根据界面方案字段构造树形结构
     */
    buildFieldsTreeData(data, nodes: any[], obj = 'systemSchemeHeader') {
        data.systemSchemeList.forEach(item => {
            const node = {
                title: item.systemSchemeTable.SCHEME_TABLE_DISPLAY_NAME,
                key: item.systemSchemeTable.TABLE_CODE,
                isLeaf: item[obj].length === 0,
                children: [],
                disabled: true,
                nodeType: 0,
                icon: 'tags',
            };

            item[obj].forEach(field => {
                node.children.push({
                    ...field,
                    title: field.TABLE_COLUMN_NAME,
                    key: field.TABLE_COLUMN_CODE,
                    isLeaf: true,
                    nodeType: 1,
                    icon: 'file',
                });
            });
            nodes.push(node);
        });
    }

    // 定制显示
    customDisplay() {
        if (this.fieldsAdjust.alternativeTree.nodes.length === 0) {
            this.service.getChemeContent(this.permisson).subscribe(result => {
                if (result) {
                    const nodes = [];
                    this.buildFieldsTreeData(result, nodes, 'systemSchemeEdit');
                    this.fieldsAdjust.alternativeTree.nodes = nodes;
                }
            });
        }

        this.fieldsAdjust.open();
    }

    // 输出excel表
    downLoadFile() {
        const params = {
            pageIndex: this.queryTable.pageIndex,
            pageSize: this.queryTable.pageSize,
            userParameterTypeEnum: UserParameterTypeEnum.SENIOR_QUERY_VIEW_FIELD,
            recordCount: this.oldAndNewData.isNewOrOldStatus,
            queryWhereList: this._getQueryWhereList(),
        };
        this.commonService.downFilePost(
            'api/gl-service-data/v1/data/core/senior/query/outputExcelByExcute',
            params,
            '高级查询信息花名册.xls'
        );
    }
}
