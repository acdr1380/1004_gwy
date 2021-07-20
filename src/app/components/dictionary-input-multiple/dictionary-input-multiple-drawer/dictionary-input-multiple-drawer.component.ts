import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNode, NzFormatEmitEvent, NzTreeComponent } from 'ng-zorro-antd/tree';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DictionaryInputMultipleService } from '../dictionary-input-multiple.service';

@Component({
    selector: 'gl-dictionary-input-multiple-drawer',
    templateUrl: './dictionary-input-multiple-drawer.component.html',
    styleUrls: ['./dictionary-input-multiple-drawer.component.scss'],
})
export class DictionaryInputMultipleDrawerComponent implements OnInit {
    /**
     * 代码项
     */
    _code: string;
    @Input() set code(v: string) {
        this._code = v;
        this.dictionaryInfo = null;
        this.dictionaryDrawerIfy.tree.nodes = [];
    }
    get code() {
        return this._code;
    }

    /**
     * 选择代码项 双向绑定
     */
    @Input() value: any;
    @Output() valueChange = new EventEmitter<any>();

    /**
     * 选择代码项 双向绑定
     */
    @Input() text: any;
    @Output() textChange = new EventEmitter<any>();
    /**
     * 确认后事件
     */
    @Output() confirmChange = new EventEmitter<any>();

    /**
     * 代码抽屉是否打开 双向绑定
     */
    @Input() set visible(v: boolean) {
        this.dictionaryDrawerIfy.visible = v;
        if (v) {
            this.initOperation();
        }
    }
    @Output() visibleChange = new EventEmitter<any>();

    /**
     * 过滤方式
     */
    @Input() filterWay = false; // true: 显示， false: 不显示
    /**
     * 过滤项
     */
    @Input() filterItems: string[] = [];

    /**
     * 自定义父节点
     */
    @Input() parent = '-1';

    // --------------------分割线--------------------
    defaultSelectedKeys = [];
    defaultExpandedKeys = [];

    checkList = [];

    /**
     * 特殊代码
     */
    specialCodeList = ['N'];

    @ViewChild('scrollViewport', { static: false })
    private scrollViewport: CdkVirtualScrollViewport;
    @ViewChild('dictionaryTreeElement', { static: false })
    private dictionaryTreeElement: NzTreeComponent;

    // 字典树抽屉
    dictionaryDrawerIfy = {
        width: 500,
        visible: false,
        title: '选择内容',
        close: () => {
            this.dictionaryDrawerIfy.visible = false;
            this.visibleChange.emit(false);
        },
        open: () => {
            this.dictionaryDrawerIfy.visible = true;
            this.visibleChange.emit(true);
        },

        find: {
            list: <any>[],
            parentList: [],
            keyword: null,
            evtOpenChange: status => {
                if (status) {
                    this.dictionaryDrawerIfy.find.keyword = null;
                }
            },
            evtOnSearch: (keyword: string) => {
                if (keyword) {
                    this.service.searchKeyword(this.code, keyword.trim()).then(result => {
                        this.dictionaryDrawerIfy.find.list = result;
                    });
                }
            },
            evtChange: value => {
                if (!value) {
                    return;
                }
                this.service.getParentAllList(this.code, value).subscribe(result => {
                    this.dictionaryDrawerIfy.find.parentList = result;
                    const nodes = this.dictionaryTreeElement.getTreeNodes();
                    // this.getDictionaryTreeNode().subscribe(nodes => {
                    //     this.dictionaryDrawerIfy.tree._selectedLocationOrg(nodes, value);
                    // });
                    this.dictionaryDrawerIfy.tree._selectedLocationOrg(nodes, value);
                });
            },
        },
        tree: {
            nodes: [],
            activedNode: <NzTreeNode>null,
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.dictionaryDrawerIfy.tree.activedNode = data.node;
            },
            evtCheckBoxChange: (event: NzFormatEmitEvent) => {
                this.checkList = event.checkedKeys;
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;

                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getSysDicItemList(this.code, node.key)
                            .then(nodes => node.addChildren(this.filterDictionaryTree(nodes)));
                    }
                }
            },
            /**
             * 定位
             */
            _selectedLocationOrg: (nodes: NzTreeNode[], value: string) => {
                nodes.forEach(async node => {
                    if (value === node.origin.value) {
                        this.dictionaryDrawerIfy.tree.activedNode = node;
                        this.dictionaryDrawerIfy.tree._locationedScroll();
                    } else {
                        const isExist =
                            this.dictionaryDrawerIfy.find.parentList.findIndex(
                                v => v.key === node.origin.key
                            ) > -1;
                        if (isExist) {
                            node.isExpanded = true;
                            // 有子节点并且未取出来
                            if (!node.isLeaf && node.getChildren().length === 0) {
                                const childNodes = await this.service.getSysDicItemList(
                                    this.code,
                                    node.key
                                );
                                node.addChildren(this.filterDictionaryTree(childNodes));
                            }
                            if (node.getChildren().length > 0) {
                                this.dictionaryDrawerIfy.tree._selectedLocationOrg(
                                    node.children,
                                    value
                                );
                            }
                        }
                    }
                });
            },
            /*
             * 滚动到定位节点位置
             */
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.dictionaryDrawerIfy.tree.activedNode;
                    if (node.component.elementRef) {
                        const el = <HTMLElement>node.component.elementRef.nativeElement;
                        this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                    }
                }, 300);
            },
        },
        evtConfirm: () => {
            const list = this.checkList
                .filter(node => node.isChecked)
                .map(node => {
                    return {
                        label: node.title,
                        value: node.origin.value,
                    };
                });
            this.text = list.map(v => v.label);
            this.textChange.emit(this.text);
            this.value = list.map(v => v.value);
            this.valueChange.emit(this.value);
            this.confirmChange.emit(list);
            this.dictionaryDrawerIfy.close();
        },
        evtEmpty: () => {
            this.checkList.forEach(node => (node.isChecked = false));
        },
    };

    /**
     * 字典信息
     */
    private dictionaryInfo;
    /**
     * 是否选择底层
     */
    private isLevel = false;

    constructor(
        private service: DictionaryInputMultipleService,
        private message: NzMessageService
    ) {}

    ngOnInit() {}

    /**
     *  打开代码框初始化操作
     */
    async initOperation() {
        // 如果代码信息存在或者是特殊代码就直接跳过
        if (this.dictionaryInfo?.DICTIONARY_CODE || this.specialCodeList.indexOf(this.code) > -1) {
            return;
        }
        // 加载代码相关信息（包括：代码名称、代码是否选中底层等）
        this.dictionaryInfo = await this.service.getDictionaryInfo(this.code).toPromise();
        if (this.dictionaryInfo) {
            this.isLevel = this.dictionaryInfo.DICTIONARY_LAST_LEVEL;
            this.dictionaryDrawerIfy.title = this.dictionaryInfo.DICTIONARY_NAME;
            this.loadDictionaryList();
        }
    }

    /**
     * 加载字典列表
     */
    loadDictionaryList() {
        if (this.dictionaryDrawerIfy.tree.nodes.length > 0) {
            this.dictionaryDrawerIfy.tree.nodes = this.filterDictionaryTree(
                this.dictionaryDrawerIfy.tree.nodes
            );
            this.dictionaryDrawerIfy.find.evtChange(this.value);
            return;
        }
        this.service.getSysDicItemList(this.code, this.parent).then(result => {
            this.dictionaryDrawerIfy.tree.nodes = this.filterDictionaryTree(result);
            // this.dictionaryDrawerIfy.find.evtChange(this.value);
        });
    }

    /**
     * 过滤代码树
     * @param nodes 树节点
     */
    filterDictionaryTree(nodes) {
        if (this.filterItems.length === 0) {
            return nodes;
        }
        return nodes.filter(v =>
            this.filterWay
                ? this.filterItems.indexOf(v.value) > -1
                : this.filterItems.indexOf(v.value) === -1
        );
    }

    setNodeCheck(node) {
        node.isChecked = false;
    }
}
