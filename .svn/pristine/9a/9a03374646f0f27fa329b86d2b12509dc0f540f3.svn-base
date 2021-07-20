import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AdvancedQueryService } from './advanced-query.service';
import { NzTreeNode, NzTreeComponent, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Base64 } from 'js-base64';
import { DatePipe } from '@angular/common';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { ClientService } from 'app/master-page/client/client.service';

@Component({
    selector: 'app-advanced-query',
    templateUrl: './advanced-query.component.html',
    styleUrls: ['./advanced-query.component.scss'],
    providers: [DatePipe],
})
export class AdvancedQueryComponent implements OnInit, OnDestroy {
    /**
     * 是否包含下层
     */
    isInclude = false;

    /**
     * 图标用
     */
    icon: any = <any>{};

    /**
     * 当前选择的条件 中文
     */
    where_zh_CN: Array<any> = [];

    /**
     * 代码项中文
     */
    ZH_CN = <any>{};

    /**选择年份 */
    YearOpt = {
        value: null,
        list: [],
        _load: () => {
            let year = new Date().getFullYear();
            this.YearOpt.value = year;
            this.YearOpt.list.push({ value: year, text: year });
            for (let index = 0; index < 9; index++) {
                year -= 1;
                this.YearOpt.list.push({ value: year, text: year });
            }
            this.YearOpt.list = [...this.YearOpt.list];
        },
    };
    /**
     * 页面用
     */
    page = {
        content: [],
        /**
         * 保存字段的判断条件 （0，=），（1，in），（2，like）,(3,between)
         */
        OPERATOR: <any>{},
        /**
         * 页面整体表单
         */
        form: new FormGroup({}),
        // 查询
        evtSelectData: () => {
            if (this.orgTree.selectList.length <= 0) {
                return this.message.error('请选择单位!');
            }
            if (this.where_zh_CN.length <= 0) {
                return this.message.warning('请选择条件！');
            }
            const startAge: number = this.page.form.controls.DATA_PERSON_A01.get('startAge').value;
            const endAge: number = this.page.form.controls.DATA_PERSON_A01.get('endAge').value;
            const endTime = this.page.form.controls.DATA_PERSON_A01.get('E0141').value;
            if ((startAge || endAge || endTime) && (!endTime || !startAge || !endAge)) {
                return this.message.warning('年龄条件不足！');
            }
            const data = this.getWhere();
            this.router.navigate(['advanced-result', { GL: Base64.encode(JSON.stringify(data)) }], {
                relativeTo: this.activeRoute,
            });
        },
    };

    /**年龄特殊处理，单独保存 */
    startAge: number = null;

    endAge: number = null;

    @ViewChild('orgUnitElement', { static: false }) private orgUnitElement: NzTreeComponent;
    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;

    PClass = {
        value: [
            {
                label: '在职人员库',
                value: '01',
                checked: true,
            },
            {
                label: '非在职人员库',
                value: '02',
                checked: false,
            },
        ],
        evtChangePClss: event => {
            const item = event.filter(x => x.checked).map(x => x.value);
            // console.log(item);
            this.page.form.controls.DATA_PERSON_A01.get('PClassID').setValue(item);
        },
    };

    /**
     * 机构树
     */
    orgTree = {
        nodes: [],
        selectList: [],
        /**
         * 初始化选中CheckBox数组
         */
        _selectList: [],
        OrgName: '',
        nodeIcon: ['sitemap', 'server', 'building-o'],
        activeNode: <NzTreeNode>null,
        // 是否包含下层
        isInclude: false,
        // 机构分组
        group: {
            groupID: null,
            list: [],
            evtChange: () => {
                this.orgTree.activeNode = null;
                this.loadOrgTree();
            },
        },
        // 点击节点数触发
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.orgTree.activeNode = data.node;
        },
        // 点击展开树节点图标触发
        evtChangeNode: (event: NzFormatEmitEvent): void => {
            if (event.eventName === 'expand') {
                const node = event.node;
                if (node && node.getChildren().length === 0 && node.isExpanded) {
                    this.service
                        .getTreeData(this.orgTree.group.groupID, node.key)
                        .subscribe(nodes => {
                            node.addChildren(nodes);
                            this.setExpandCheckChildNodes(
                                node,
                                this.isInclude && node.origin.checked
                            );
                            this.orgTree._setChecked(node.getChildren());
                        });
                }
            }
        },
        /**
         * CheckBox改变事件
         */
        evtCheckBoxChange: event => {
            const node = event.node;
            const checked = node.origin.checked;
            if (!!checked) {
                this.orgTree.selectList.push(node);
                this.setExpandCheckChildNodes(node, this.isInclude);
            } else {
                let index = this.orgTree.selectList.findIndex(
                    x => x.origin.Key === node.origin.key
                );
                this.orgTree.selectList.splice(index, 1);
                index = this.orgTree._selectList.findIndex(
                    x => x.DATA_UNIT_ORG_ID === node.origin.key
                );
                this.orgTree._selectList.splice(index, 1);
                this.setExpandCheckChildNodes(node, checked);
            }
            if (this.orgTree.selectList.length > 0) {
                this.orgTree.OrgName = this.orgTree.selectList[0].origin.ORG_NAME;
            } else {
                this.orgTree.OrgName = null;
            }
        },
        // 机构树搜索框
        find: {
            searchValue: null,
            list: [],
            parentList: [],
            // 下拉菜单打开状态回调
            evtOpenChange: status => {
                if (status) {
                    this.orgTree.find.searchValue = null;
                }
            },
            // 文本框值改变回调
            evtOnSearch: (value: string) => {
                if (value) {
                    this.service
                        .selectListByQuery(this.orgTree.group.groupID, value.trim())
                        .subscribe(result => (this.orgTree.find.list = result));
                }
            },
            // 选中的optiong改变回调
            evtChange: value => {
                this.service.getOrgParentAllList(value).subscribe(result => {
                    this.orgTree.find.parentList = result;
                    const nodes = this.orgUnitElement.getTreeNodes();
                    this.orgTree._selectedLocationOrg(nodes, value);
                });
            },
        },
        /**
         * 定位机构树节点
         */
        _selectedLocationOrg: (nodes: NzTreeNode[], loctionOrg: string) => {
            nodes.forEach(async node => {
                if (loctionOrg === node.key) {
                    this.orgTree.activeNode = node;
                    this.orgTree._locationedContinue();
                    this.orgTree._locationedScroll();
                } else {
                    const isExist =
                        this.orgTree.find.parentList.findIndex(
                            v => v.DATA_UNIT_ORG_ID === node.key
                        ) > -1;
                    if (isExist) {
                        node.isExpanded = true;
                        // 有子节点并且未取出来
                        if (!node.isLeaf && node.getChildren().length === 0) {
                            const childNodes = await this.orgTree._asyncLoadNodeChildNode(node);
                            node.addChildren(childNodes);
                        }
                        if (node.getChildren().length > 0) {
                            this.orgTree._selectedLocationOrg(node.children, loctionOrg);
                        }
                    }
                }
            });
        },
        /*
         * 查询子节点
         */
        _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
            return this.service.getTreeData(this.orgTree.group.groupID, node.key).toPromise();
        },
        /*
         * 滚动到定位节点位置
         */
        _locationedScroll: () => {
            setTimeout(() => {
                const node: any = this.orgTree.activeNode;
                const el = <HTMLElement>node.component.dragElement.nativeElement;
                this.scrollViewport.scrollToOffset(el.offsetTop - 30);
            }, 100);
        },
        /*
         * 定位机构树节点后执行
         */
        _locationedContinue: () => {},
        /**
         * 设置节点check选中状态
         * @returns 返回一个节点数组
         */
        _setChecked: nodes => {
            const that = this;
            // const nodes = this.orgUnitElement.getTreeNodes();
            nodes.forEach((node: NzTreeNode) => {
                const i = that.orgTree._selectList.findIndex(x => x.DATA_UNIT_ORG_ID === node.key);
                if (i !== -1) {
                    // node.checked = true;
                    node.setChecked(true);
                    this.orgTree.selectList.push(node);
                }
            });
            if (this.orgTree.selectList.length > 0) {
                this.orgTree.OrgName = this.orgTree.selectList[0].origin.ORG_NAME;
            } else if (this.orgTree._selectList.length > 0) {
                this.orgTree.OrgName = this.orgTree._selectList[0].ORG_NAME;
            }
            return nodes;
        },
    };
    /**
     * 选择单位
     */
    treeDrawer = {
        visible: false,
        width: 350,
        title: '选择单位',
        open: () => {
            this.treeDrawer.visible = true;
        },
        close: () => {
            this.treeDrawer.visible = false;
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
            if (this.orgTree.selectList.length <= 0) {
                return this.message.error('请选择单位!');
            }
            if (this.where_zh_CN.length <= 0) {
                return this.message.warning('请选择条件！');
            }
            const startAge: number = this.page.form.controls.DATA_PERSON_A01.get('startAge').value;
            const endAge: number = this.page.form.controls.DATA_PERSON_A01.get('endAge').value;
            const endTime = this.page.form.controls.DATA_PERSON_A01.get('E0141').value;
            if ((startAge || endAge || endTime) && (!endTime || !startAge || !endAge)) {
                return this.message.warning('年龄条件不足！');
            }
            const where = this.getWhere();
            const name = this.conditionDrawer.form.getRawValue().QUERY_HISTORY_NAME;
            this.conditionDrawer.btnloading = true;
            this.service
                .saveWhere({
                    QUERY_HISTORY_NAME: name,
                    QUERY_HISTORY_CONTENT: where,
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

    /**
     * 查看历史抽屉
     */
    historyDrawer = {
        visible: false,
        title: '查看历史',
        width: 500,
        open: () => {
            this.historyDrawer._getWhereList();
            this.historyDrawer.visible = true;
        },
        close: () => {
            this.historyDrawer.visible = false;
        },
        table: {
            loading: false,
            pageIndex: 1,
            pageSize: 15,
            total: 0,
            data: [],
        },
        /**
         * 已选择数组
         */
        checkedList: [],
        /**
         * 初始化数据
         */
        _getWhereList: () => {
            this.historyDrawer.table.loading = true;
            this.service
                .getHistoryquery({
                    $PAGE_INDEX$: this.historyDrawer.table.pageIndex,
                    $PAGE_SIZE$: this.historyDrawer.table.pageSize,
                })
                .subscribe(json => {
                    this.historyDrawer.table.loading = true;
                    if (json.code !== 0) {
                        return false;
                    }
                    this.historyDrawer.table.data = json.data.result;
                    if (this.historyDrawer.table.pageIndex === 1) {
                        this.historyDrawer.table.total = json.data.totalCount;
                    }
                });
        },
        isCheckedAll: false,
        /**
         * 选择全部
         */
        checkedAll: checked => {
            this.historyDrawer.table.data.forEach(item => {
                item.checked = checked;
            });
            if (checked) {
                this.historyDrawer.checkedList = this.historyDrawer.table.data;
            } else {
                this.historyDrawer.checkedList = [];
            }
        },
        /**
         * 选中某一项
         */
        checked: (index, checked) => {
            this.historyDrawer.table.data[index].checked = checked;
            if (checked) {
                this.historyDrawer.checkedList.push(this.historyDrawer.table.data[index]);
            } else {
                const i = this.historyDrawer.checkedList.find(
                    x =>
                        x.SYS_USER_QUERY_HISTORY_ID ===
                        this.historyDrawer.table.data[index].SYS_USER_QUERY_HISTORY_ID
                );
                this.historyDrawer.checkedList.splice(i, 1);
            }
            if (this.historyDrawer.checkedList.length === this.historyDrawer.table.data.length) {
                this.historyDrawer.isCheckedAll = true;
            } else {
                this.historyDrawer.isCheckedAll = false;
            }
        },
        /**
         * 删除
         */
        remove: () => {
            const whereList = this.historyDrawer.checkedList.map(x => x.SYS_USER_QUERY_HISTORY_ID);
            this.service.removeWhere({ SYS_USER_QUERY_HISTORY_ID: whereList }).subscribe(json => {
                if (json.code !== 0) {
                    return false;
                }
                this.historyDrawer._getWhereList();
            });
        },
        /**
         * 点击查询
         */
        evtSelect: item => {
            this.router.navigate(['advanced-result', { GL: Base64.encode(JSON.stringify(item)) }], {
                relativeTo: this.activeRoute,
            });
        },
    };

    constructor(
        private service: AdvancedQueryService,
        private clientService: ClientService,
        private message: NzMessageService,
        private fb: FormBuilder,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private datePipe: DatePipe,
        private modalService: NzModalService
    ) {}

    /**
     * 包含下层回调
     */
    includeChange(event) {
        this.orgTree.selectList.forEach(x => {
            this.setExpandCheckChildNodes(x, event);
        });
    }

    /**
     * 设置所有已知子节点的选中状态
     *
     * @private
     * @param {NzTreeNode} node 节点
     * @param {boolean} status 选中状态
     * @memberof SettingComponent
     */
    private setExpandCheckChildNodes(node: NzTreeNode, status: boolean = false): void {
        node.children.forEach(v => {
            v.setChecked(status);
            v.origin.includeChild = status;
            if (v.getChildren().length > 0) {
                this.setExpandCheckChildNodes(v, status);
            }
        });
    }

    ngOnInit() {
        this.YearOpt._load();
        // 面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '高级查询',
            },
        ]);

        // 页面配置信息
        this.service.getPageLayout().subscribe((data: []) => {
            this.page.content = data;
            const pagedata = {};
            data.map((list: { SetID: string; Container: Array<any> }) => {
                const form = {};
                list.Container.forEach((items: Array<any>) => {
                    items.forEach(
                        (item: {
                            ItemID: string;
                            ItemType: string;
                            OPERATOR: number;
                            QueryItems?: Array<any>;
                        }) => {
                            this.page.OPERATOR[item.ItemID] = item.OPERATOR;
                            if (item.ItemType === 'checkbox') {
                                form[item.ItemID] = [[...item.QueryItems]];
                            } else if (item.ItemID === 'A1521') {
                                form[item.ItemID] = null;
                                this.page.content[
                                    this.page.content.findIndex(
                                        x => x.SetID === 'DATA_1002_PERSON_A15'
                                    )
                                ].Container.forEach(x => {
                                    x.forEach(m => {
                                        if (m.ItemID === 'A1521') {
                                            m.QueryItems = this.YearOpt.list;
                                        }
                                    });
                                });
                            } else {
                                form[item.ItemID] = null;
                            }
                        }
                    );
                });

                const formG = this.fb.group(form);
                if (list.SetID === 'DATA_PERSON_A01') {
                    formG.addControl('startAge', new FormControl(null));
                    formG.addControl('endAge', new FormControl(null));
                }
                pagedata[list.SetID] = formG;
                // 设置图标
                this.icon[list.SetID] = 'down';
            });
            this.page.form = this.fb.group(pagedata);
            this.page.form.controls.DATA_PERSON_A01.get('PClassID')
                .valueChanges.pipe(
                    // filter(value => value.length > 0),
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    this.PClass.value.forEach(x => {
                        if (value && value.findIndex(m => m === x.value) > -1) {
                            x.checked = true;
                        } else {
                            x.checked = false;
                        }
                    });
                    // this.PClass.value = value;
                });
            // 在页面加载完成后给页面初始化数据
            this.activeRoute.paramMap.subscribe((param: Params) => {
                if (param.has('GL')) {
                    const params = JSON.parse(Base64.decode(param.get('GL')));
                    const formData = <any>{};
                    Object.keys(params.QUERY_WHERE_LIST).forEach(tableNmae => {
                        formData[tableNmae] = <any>{};
                        // 循环子集字段
                        Object.keys(params.QUERY_WHERE_LIST[tableNmae]).forEach(item => {
                            const itemValue = params.QUERY_WHERE_LIST[tableNmae][item];
                            formData[tableNmae][itemValue.FIELD] = itemValue.VALUE;
                        });
                    });
                    this.orgTree._selectList = params.QUERY_ORG_LIST;
                    this.orgTree.selectList = params.QUERY_ORG_LIST;
                    if (params.QUERY_ORG_LIST.length > 0) {
                        this.orgTree.OrgName = params.QUERY_ORG_LIST[0].ORG_NAME;
                    }
                    this.isInclude = params.isInclude;
                    this.where_zh_CN = params.where_zh_CN;
                    this.page.form.reset(formData);
                } else {
                    this.page.form.controls.DATA_PERSON_A01.get('PClassID').setValue(['01']);
                    this.where_zh_CN = [
                        ...this.where_zh_CN,
                        {
                            ItemID: 'PClassID',
                            text: '人员库',
                            SetID: 'DATA_PERSON_A01',
                            value: '在职人员库',
                        },
                    ];
                }
            });
        });
        // 加载机构树数据
        this.loadOrgGroupList();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载机构分组
     */
    loadOrgGroupList() {
        this.service.getOrgGroupList().subscribe(result => {
            this.orgTree.group.list = result;
            const [first] = result;
            this.orgTree.group.groupID = first.value;
            this.loadOrgTree();
        });
    }

    /**
     * 加载机构树信息
     */
    loadOrgTree() {
        this.service.getTreeData(this.orgTree.group.groupID).subscribe(result => {
            this.orgTree.nodes = result;
            setTimeout(() => {
                this.orgTree._setChecked(this.orgUnitElement.getTreeNodes());
            }, 1000);
        });
    }

    /**
     * 获取查询条件
     */
    getWhere() {
        const data = {} as {
            $PAGE_INDEX$: number;
            $PAGE_SIZE$: number;
            QUERY_WHERE_LIST: any;
            QUERY_ORG_LIST: Array<any>;
            isInclude: boolean;
            where_zh_CN: Array<any>;
        };
        const from = this.page.form.getRawValue();
        // 获取单位
        data.QUERY_ORG_LIST = this.orgTree.selectList.map(x => {
            return {
                origin: x.origin,
                DATA_UNIT_ORG_ID: x.DATA_UNIT_ORG_ID || x.origin.DATA_UNIT_ORG_ID,
                ORG_NAME: x.ORG_NAME || x.origin.ORG_NAME,
                IS_INCLUDE_SUBLAYER: this.isInclude,
            };
        });
        data.isInclude = this.isInclude;
        const tableGroup = <any>{};
        // 循环子集
        Object.keys(from).forEach(tableNmae => {
            const tableData = <any>[];
            // 循环子集字段
            Object.keys(from[tableNmae]).forEach(item => {
                const itemValue = from[tableNmae][item];
                // 判断值是否为空
                if (itemValue !== null && itemValue !== '' && itemValue.length > 0) {
                    tableData.push({
                        FIELD: item,
                        OPERATOR: this.page.OPERATOR[item],
                        VALUE: itemValue,
                    });
                }
            });
            if (tableData.length > 0) {
                tableGroup[tableNmae] = tableData;
            }
        });
        data.QUERY_WHERE_LIST = tableGroup;
        data.where_zh_CN = this.where_zh_CN;
        return data;
    }

    ngModelChange(data, val, SetID) {
        // console.log(data);
        const res: any = { text: data.ItemName, ItemID: data.ItemID, SetID: SetID };
        if (val) {
            // 根据类别分别获取字段民 与 值
            switch (data.ItemType) {
                case 'string':
                case 'in':
                    res.value = val;
                    break;
                case 'code':
                    res.value = this.ZH_CN[data.ItemID];
                    break;
                case 'select':
                    res.value = data.QueryItems.find(x => x.value === val).text;
                    break;
                case 'selects':
                    res.value = data.QueryItems.filter(x => val.findIndex(m => m === x.value) > -1)
                        .map(x => x.text)
                        .join(',');
                    break;
                case 'selectg':
                    data.QueryItems.forEach(x => {
                        const a = x.GroupItems.find(m => m.value === val);
                        if (a) {
                            res.value = a.text;
                        }
                    });
                    break;
                case 'dateTodate':
                    if (val.length > 0) {
                        res.value = `${this.datePipe.transform(
                            val[0],
                            'yyyy年MM月dd日'
                        )} 至 ${this.datePipe.transform(val[1], 'yyyy年MM月dd日')}`;
                    } else {
                        res.value = '';
                    }
                    break;
                case 'dateYear':
                    if (val) {
                        res.value = `${this.datePipe.transform(val[0], 'yyyy年')}`;
                    } else {
                        res.value = '';
                    }
                    break;
                case 'checkbox':
                    res.value = val
                        .filter(x => x.checked)
                        .map(x => x.label)
                        .join(',');
                    break;
                case 'codes':
                    console.log(val);
                    break;
                case 'year':
                    const startAge: number = this.page.form.controls.DATA_PERSON_A01.get('startAge')
                        .value;
                    const endAge: number = this.page.form.controls.DATA_PERSON_A01.get('endAge')
                        .value;
                    const endTime = this.page.form.controls.DATA_PERSON_A01.get('E0141').value;
                    if (!(startAge && endAge && endTime)) {
                        return;
                    }
                    res.value = `从出生到${this.datePipe.transform(
                        endTime,
                        'yyyy年MM月dd日'
                    )}之间，年龄在${startAge}岁到${endAge}岁之间`;
                    break;
            }
        }

        const index = this.where_zh_CN.findIndex(x => x.ItemID === data.ItemID);
        // 判断是否已经有这个字段，有就更新
        if (index > -1) {
            this.where_zh_CN[index] = res;
            // 如果值为空删除
            if (res.value === '' || val === null || val === '') {
                this.where_zh_CN.splice(index, 1);
            }
            this.where_zh_CN = [...this.where_zh_CN];
        } else if (val) {
            this.where_zh_CN = [...this.where_zh_CN, res];
        }
    }

    /**
     * 清空查询条件
     */
    evtClearForm() {
        this.page.form.reset();
        this.page.form.patchValue({
            DATA_PERSON_A01: {
                WZW: [
                    {
                        value: '',
                        label: '其他现职人员（无职务）',
                    },
                ],
            },
        });
        this.where_zh_CN = [];
    }

    /**
     * 图标点击
     */
    evtClickIcon(SetID: string, type: string) {
        this.icon[SetID] = type === 'down' ? 'up' : 'down';
    }

    /**条件标签点击关闭 */
    evtTagOnClose(event) {
        this.where_zh_CN.splice(
            this.where_zh_CN.findIndex(x => x.ItemID === event.ItemID),
            1
        );
        this.page.form.controls[event.SetID].get(event.ItemID).setValue(null);
        if (event.ItemID === 'E0141') {
            this.page.form.controls[event.SetID].get('startAge').setValue(null);
            this.page.form.controls[event.SetID].get('endAge').setValue(null);
        }
        if (event.ItemID === 'WZW') {
            this.page.form.controls[event.SetID].get('WZW').setValue([
                {
                    value: '',
                    label: '其他现职人员（无职务）',
                },
            ]);
            this.where_zh_CN = [];
        }
    }
}
