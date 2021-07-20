import { DictionaryInputService } from './../dictionary-input.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { NzTreeComponent, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dictionary-drawer',
    templateUrl: './dictionary-drawer.component.html',
    styleUrls: ['./dictionary-drawer.component.scss'],
})
export class DictionaryDrawerComponent implements OnInit {
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
     * 代码中文 双向绑定
     */
    @Input() text: string;
    @Output() textChange = new EventEmitter<any>();

    /**
     * 选择代码项 双向绑定
     */
    @Input() value: string;
    @Output() valueChange = new EventEmitter<any>();
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
        width: 380,
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
                    this.dictionaryTabIfy.selectedIndex = 1;
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
                this.dictionaryItemSelected();
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
                    if (node.component.dragElement) {
                        const el = <HTMLElement>node.component.dragElement.nativeElement;
                        this.scrollViewport.scrollToOffset(el.offsetTop - 30);
                    }
                }, 300);
            },
        },
        evtConfirm: () => {
            this.setDictionaryData();
        },
        evtEmpty: () => {
            this.text = null;
            this.textChange.emit(this.text);
            this.value = null;
            this.valueChange.emit(this.value);
            this.confirmChange.emit();
            this.dictionaryDrawerIfy.close();
        },
    };

    // 字典标签
    dictionaryTabIfy = {
        selectedIndex: 0,
        evtChange: ({ index }) => {
            this.dictionaryTabIfy.selectedIndex = index;
            switch (index) {
                case 0:
                    this.filterOftenUse();
                    break;
                case 1:
                    this.loadDictionaryList();
                    break;
            }
        },
    };

    //  常用代码
    oftenUseIfy = {
        list: [],
    };

    /**
     * 字典信息
     */
    private dictionaryInfo;
    /**
     * 是否选择底层
     */
    private isLevel = false;

    constructor(private service: DictionaryInputService, private message: NzMessageService) {}

    ngOnInit() {}

    /**
     *  打开代码框初始化操作
     */
    async initOperation() {
        // 获得常用代码
        const useList = await this.service.getOftenUseList(this.code);
        this.oftenUseIfy.list = useList || [];
        if (this.oftenUseIfy.list.length > 0) {
            // 存在常用代码直接显示
            this.dictionaryTabIfy.evtChange({ index: 0 });
        }

        // 如果代码信息存在或者是特殊代码就直接跳过
        if (this.dictionaryInfo?.DICTIONARY_CODE || this.specialCodeList.indexOf(this.code) > -1) {
            return;
        }
        // 加载代码相关信息（包括：代码名称、代码是否选中底层等）
        this.dictionaryInfo = await this.service.getDictionaryInfo(this.code).toPromise();
        if (this.dictionaryInfo) {
            this.isLevel = this.dictionaryInfo.DICTIONARY_LAST_LEVEL;
            this.dictionaryDrawerIfy.title = this.dictionaryInfo.DICTIONARY_NAME;

            // 常用代码不存在，并且代码信息加载完毕后，加载代码树，因为选中时用到是否选择底层。
            if (this.oftenUseIfy.list.length === 0) {
                this.dictionaryTabIfy.evtChange({ index: 1 });
            }
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
            this.dictionaryDrawerIfy.find.evtChange(this.value);
        });
    }

    /**
     * 字典项选中事件
     */
    dictionaryItemSelected() {
        const { origin } = this.dictionaryDrawerIfy.tree.activedNode;
        if (!origin.SYS_HAVE_CHILD) {
            this.setDictionaryData();
        }
    }

    /**
     * 设置字典选择器的值
     */
    setDictionaryData() {
        const node = this.dictionaryDrawerIfy.tree.activedNode;
        if (node.origin.SYS_HAVE_CHILD && this.isLevel) {
            this.message.warning('只能选择最底层');
            return;
        }

        switch (this.code) {
            case 'N':
                if (node.origin.ORG_TYPE !== OrgTypeEnum.UNIT) {
                    this.message.warning('只能选择单位');
                    return;
                }
                break;
        }
        this.text = node.title;
        this.textChange.emit(this.text);
        this.value = node.origin.value;
        this.valueChange.emit(this.value);
        this.confirmChange.emit();
        this.dictionaryDrawerIfy.close();

        // 保存常用代码
        this.service.saveOftenUseData(this.code, {
            title: node.title,
            value: node.origin.value,
        });
    }

    /**
     * 常用代码选中事件
     * @param item 常用代码
     */
    evtSelectedOftenUseItem(item) {
        this.text = item.title;
        this.textChange.emit(this.text);
        this.value = item.value;
        this.valueChange.emit(this.value);
        this.confirmChange.emit();
        this.dictionaryDrawerIfy.tree.activedNode = null;
        this.dictionaryDrawerIfy.close();
    }

    /**
     * 过滤常用代码
     */
    filterOftenUse() {
        if (this.filterItems.length === 0) {
            return;
        }
        // 常用代码
        if (this.oftenUseIfy.list) {
            this.oftenUseIfy.list = this.oftenUseIfy.list.filter(v =>
                this.filterWay
                    ? this.filterItems.indexOf(v.value) > -1
                    : this.filterItems.indexOf(v.value) === -1
            );
        }
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
}
