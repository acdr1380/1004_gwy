import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { NzFormatEmitEvent, NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMenuItemDirective } from 'ng-zorro-antd/menu';
import { NzContextMenuService } from 'ng-zorro-antd/dropdown';

import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { FavoritesService } from '../favorites/favorites.service';
import { NotesService } from '../notes/notes.service';
import { DocumentService } from './document.service';

import { Base64 } from 'js-base64';
import { PolicyInfo } from '../../db/entity/PolicyInfo';
import { FeedBackEnumList } from '../../db/enum/FeedBackEnum';
import { BackInfo } from '../../db/entity/BackInfo';
import { TagInfo } from '../../db/entity/TagInfo';
import { FeedBackOperationEnumList } from '../../db/enum/FeedBackOperationEnum';
import { NoteInfoVO } from '../../db/vo/NoteInfoVO';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private service: DocumentService,
        private sanitizer: DomSanitizer,
        private NzContextService: NzContextMenuService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private message: NzMessageService,
        private modalService: NzModalService,
        private notesService: NotesService,
        private favoritesService: FavoritesService
    ) {}
    @ViewChild('documentRef', { static: false }) documentRef: ElementRef;
    private dropdown: any;

    /**
     * 反馈类型
     */
    feedBackEnumList = FeedBackEnumList;
    /**
     * 按钮信息
     */
    operationBtnGroup = [
        {
            text: '收藏',
            icon: 'star-half-o',
            type: 'collect',
        },
        {
            text: '纠错反馈',
            icon: 'comments-o',
            type: 'back',
        },
    ];

    /**
     * 文档总数据
     */
    policyInfoData: PolicyInfo = <PolicyInfo>{};
    /**
     * 选中内容
     */
    signSelectorText = '';
    /**
     * 选中内容对象
     */
    selectionIfy: {
        anchorNodeId: string;
        anchorOffset: number;
        anchorIndex: number;
        focusNodeId: string;
        focusOffset: number;
        focusIndex: number;
    };

    /**
     * 纠错反馈单条数据抽屉
     */
    recoveryError = {
        title: '纠错反馈',
        width: 500,
        visible: false,
        open: () => (this.recoveryError.visible = true),
        close: () => {
            this.recoveryError.isEdit = false;
            this.recoveryError.visible = false;
        },
        form: new FormGroup({
            type: new FormControl(null, Validators.required),
            backContent: new FormControl(null, Validators.required),
        }),
        /**
         * 是否编辑当前行纠错信息
         */
        isEdit: false,
        edit_backId: null,

        save: () => {
            if (this.commonService.formVerify(this.recoveryError.form)) {
                const data = this.recoveryError.form.getRawValue();
                // 编辑当前行纠错数据更新
                if (this.recoveryError.isEdit) {
                    data.backId = this.recoveryError.edit_backId;
                    this.service.updateBackData(data).subscribe(result => {
                        if (result) {
                            const index = this.recoveryTable.dataAll.findIndex(
                                v => v.backId === result.backId
                            );
                            this.recoveryTable.dataAll[index] = result;
                            this.recoveryTable.filterState();
                            this.message.success('反馈更新成功。');
                            this.recoveryError.close();
                        }
                    });
                    return;
                }
                // 保存新增纠错信息
                data.policyId = this.URLParams.policyId;
                data.chooseContent = this.signSelectorText;
                this.service.saveBackData(data).subscribe(result => {
                    if (result) {
                        this.message.success('反馈已提交。');
                        this.recoveryError.close();
                    }
                });
            }
        },
    };

    /**
     * 纠错所有数据抽屉
     */
    recoveryTable = {
        title: '纠错反馈',
        width: 600,
        visible: false,
        open: () => (this.recoveryTable.visible = true),
        close: () => (this.recoveryTable.visible = false),
        // 数据状态
        tabset: FeedBackOperationEnumList,
        selectIndex: 0,
        evtSelectChange: event => {
            this.recoveryTable.filterState();
        },
        data: [],
        dataAll: [],
        /**
         * 取全部纠错数据
         */
        load: () => {
            this.service.getBackDataList(this.URLParams.policyId).subscribe(result => {
                this.recoveryTable.dataAll = result;
                this.recoveryTable.filterState();
            });
            this.recoveryTable.open();
        },
        filterState: () => {
            this.recoveryTable.data = this.recoveryTable.dataAll.filter((v: BackInfo) => {
                return (
                    v.operation === this.recoveryTable.tabset[this.recoveryTable.selectIndex].value
                );
            });
        },
        /**
         * 数据类型转换
         */
        getTypeEn: value => {
            const item = this.feedBackEnumList.find(v => v.value === value);
            return item ? item.text : '';
        },

        // 编辑当前行纠错数据操作
        edit: (row: BackInfo) => {
            this.signSelectorText = row.chooseContent;
            this.recoveryError.isEdit = true;
            this.recoveryError.edit_backId = row.backId;
            this.recoveryError.form.patchValue(row);
            // 已处理状态纠错信息，禁用表单
            if (this.recoveryTable.selectIndex === 1) {
                this.recoveryError.form.disable();
            } else {
                this.recoveryError.form.enable();
            }
            this.recoveryError.open();
        },
        // 删除纠错行
        delete: (row: BackInfo) => {
            this.modalService.confirm({
                nzTitle: `系统提示`,
                nzContent: `<b style="color: red;">确定要删除反馈吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service.deleteBackData(row.backId).subscribe(isSucceed => {
                        if (isSucceed) {
                            this.message.success('删除成功。');
                            const index = this.recoveryTable.dataAll.findIndex(
                                v => v.backId === row.backId
                            );
                            this.recoveryTable.dataAll.splice(index, 1);
                            this.recoveryTable.filterState();
                        }
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    @ViewChild('scrollCollectList', { static: false })
    private _scrollCollectList: CdkVirtualScrollViewport;
    /**
     * 收藏抽屉相关
     */
    collect = {
        title: '收藏文件',
        width: 500,
        visible: false,
        open: () => (this.collect.visible = true),
        close: () => (this.collect.visible = false),
        /**
         * 分类数据
         */
        classify: [],
        form: new FormGroup({
            favoritesName: new FormControl(null, Validators.required),
            groupId: new FormControl(null, Validators.required),
        }),
        // 添加分组
        addGroup: () => this.collect.group.open(),
        // 保存收藏信息
        save: () => {
            if (this.commonService.formVerify(this.collect.form)) {
                const data = this.collect.form.getRawValue();
                data.policyId = this.URLParams.policyId;
                this.favoritesService.saveFavoritesData(data).subscribe(result => {
                    if (result) {
                        this.message.success('收藏文件成功。');
                        this.collect.close();
                    }
                });
            }
        },

        /**
         * 添加分类抽屉内容
         */
        groupEdit: {
            width: 300,
            visible: false,
            title: '分组信息',
            close: () => (this.collect.groupEdit.visible = false),
            open: () => (this.collect.groupEdit.visible = true),
            form: new FormGroup({
                groupName: new FormControl(null, Validators.required),
            }),
            // 保存分组数据
            save: () => {
                if (this.commonService.formVerify(this.collect.groupEdit.form)) {
                    const data = this.collect.groupEdit.form.getRawValue();
                    this.favoritesService.saveFavoritesGroupData(data).subscribe(result => {
                        if (result) {
                            this.collect.classify.push(result);
                            this.collect.classify = [...this.collect.classify];
                            this.message.success('增加分组成功。');
                            this.collect.groupEdit.close();
                        }
                    });
                }
            },
        },

        /*
         * 选择已有分类抽屉
         */
        group: {
            width: 400,
            visible: false,
            title: '分类信息',
            close: () => (this.collect.group.visible = false),
            open: () => (this.collect.group.visible = true),

            list: [],
            selectSetDB: null,
            // 选中分类
            selected: index => {
                this.collect.group.selectedIndex = index;
                this.collect.group.selectSetDB = this.collect.group.list[index];
            },
            selectedIndex: -1,
            // 搜索框
            find: {
                searchWidth: 260,
                placeholder: '输入分类关键字搜索',
                nzFilterOption: () => true,
                searchList: [],
                searchKey: null,
                list: [],
                change: (value: string) => {
                    const index = this.collect.classify.findIndex(item => item.groupId === value);
                    this.collect.group.selectedIndex = index;
                    // 滚动定位
                    this._scrollCollectList.scrollToIndex(index);
                },
                search: (searchKey: string) => {
                    if (searchKey) {
                        this.collect.group.find.list = this.collect.classify.filter(
                            item => item.groupName.indexOf(searchKey) > -1
                        );
                    }
                },
            },
            // 为收藏添加已有分类
            add: () => {
                this.collect.groupEdit.form.reset();
                this.collect.groupEdit.open();
            },
            // 编辑分类
            edit: () => {
                this.collect.groupEdit.form.patchValue({
                    groupName: this.collect.classify[this.collect.group.selectedIndex].groupName,
                });
                this.collect.groupEdit.open();
            },
            // 删除分类
            delete: index => {
                this.modalService.confirm({
                    nzTitle: `系统提示`,
                    nzContent: `<b style="color: red;">确定要删除：${this.collect.classify[index].groupName} 分类吗？</b>`,
                    nzOkText: '确定',
                    nzOkType: 'danger',
                    nzOnOk: () => {
                        this.favoritesService
                            .deleteFavoritesGroup(this.collect.classify[index].groupId)
                            .subscribe(isSucceed => {
                                if (isSucceed) {
                                    this.message.success('删除成功。');
                                    this.collect.classify.splice(index, 1);
                                    this.collect.classify = [...this.collect.classify];
                                }
                            });
                    },
                    nzCancelText: '取消',
                    nzOnCancel: () => console.log('Cancel'),
                });
            },
        },
    };

    @ViewChild('noteBookExistIfyList', { static: false })
    private _noteBookExistIfyList: CdkVirtualScrollViewport;
    @ViewChild('notesTreeElement', { static: false }) private _notesTreeElement: NzTreeComponent;
    /**
     * 标记抽屉内容
     */
    noteBook = {
        title: '增加笔记',
        width: 500,
        visible: false,
        list: <Array<NoteInfoVO>>[],
        open: () => {
            this.noteBook.form.enable({ onlySelf: true });
            this.noteBook.isRelevance = false;
            this.noteBook.visible = true;
        },
        close: () => {
            this.noteBook.isRelevance = false;
            this.noteBook.visible = false;
        },
        data: [],
        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            documentNumber: new FormControl(null),
            contentNote: new FormControl(null),
        }),

        edit_noteId: null,
        // 保存标记信息
        save: () => {
            // 选中已有笔记
            if (this.noteBook.isRelevance) {
                this.service
                    .saveTagData({
                        ...this.selectionIfy,
                        noteId: this.noteBook.edit_noteId,
                        tag: this.signSelectorText,
                    })
                    .subscribe(result => {
                        if (result) {
                            this.message.success('标记添加成功。');
                            const node = this._notesTreeElement.getTreeNodeByKey(
                                this.noteBook.edit_noteId
                            );
                            node.isLeaf = false;
                            node.addChildren([
                                {
                                    ...result,
                                    title: result.tag,
                                    key: result.id,
                                    nodeType: 1,
                                    isLeaf: true,
                                },
                            ]);
                            node.title = node.title;
                            this.noteBook.close();
                        }
                    });
                return;
            }
            // 新增标记与笔记
            if (this.commonService.formVerify(this.noteBook.form)) {
                const data: NoteInfoVO = this.noteBook.form.getRawValue();
                data.policyId = this.URLParams.policyId;
                data.tagInfos = <Array<TagInfo>>[
                    {
                        ...this.selectionIfy,
                        tag: this.signSelectorText,
                    },
                ];
                this.notesService.addNoteData(data).subscribe(result => {
                    if (result) {
                        this.message.success('笔记添加成功。');
                        this.noteBook.close();
                        const item =
                            result.tagInfos && result.tagInfos.length > 0
                                ? result.tagInfos[0]
                                : <TagInfo>{};
                        result.children = [
                            {
                                ...item,
                                title: item.tag,
                                key: item.id,
                                nodeType: 1,
                                isLeaf: true,
                            },
                        ];
                        this.notesify.nodes.push(result);
                        this.noteBook.list.push(result);
                        this.notesify.nodes = [...this.notesify.nodes];
                    }
                });
            }
        },
        // 选择已有笔记
        selectedExist: () => {
            this.noteBook.existIfy.open();
        },
        /**
         * 是否已选笔记
         */
        isRelevance: false,
        reset: () => {
            this.noteBook.form.enable({ onlySelf: true });
            this.noteBook.isRelevance = false;
            this.noteBook.form.reset();
        },

        /**
         * 已有笔记抽屉内容
         */
        existIfy: {
            width: 360,
            visible: false,
            title: '已有笔记',
            close: () => (this.noteBook.existIfy.visible = false),
            open: () => (this.noteBook.existIfy.visible = true),
            selected: index => (this.noteBook.existIfy.selectedIndex = index),
            selectedIndex: -1,

            // 搜索框
            find: {
                searchWidth: 260,
                placeholder: '输入分类关键字搜索',
                nzFilterOption: () => true,
                searchList: [],
                searchKey: null,

                list: [],
                change: (value: string) => {
                    const index = this.noteBook.list.findIndex(item => item.noteId === value);
                    this.noteBook.existIfy.selectedIndex = index;
                    this._noteBookExistIfyList.scrollToIndex(index);
                },
                search: (searchKey: string) => {
                    if (searchKey) {
                        this.noteBook.existIfy.find.list = this.noteBook.list.filter(
                            item => item.title.indexOf(searchKey) > -1
                        );
                    }
                },
            },

            // 选择已有笔记
            evtSelected: () => {
                if (this.noteBook.existIfy.selectedIndex === -1) {
                    this.message.error('未选中笔记。');
                    return;
                }
                // 禁用标记抽屉表单
                this.noteBook.form.disable({ onlySelf: true });
                this.noteBook.form.patchValue(
                    this.noteBook.list[this.noteBook.existIfy.selectedIndex]
                );
                this.noteBook.edit_noteId = this.noteBook.list[
                    this.noteBook.existIfy.selectedIndex
                ].noteId;
                // 已选笔记标识
                this.noteBook.isRelevance = true;
                this.noteBook.existIfy.close();
            },
        },
    };

    /**
     * 笔记树内容
     */
    notesify = {
        nodes: [],
        icons: ['sticky-note-o', 'hashtag'],
        activedNode: <NzTreeNode>{},
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.notesify.activedNode = data.node;
            const { origin } = data.node;
            if (origin.nodeType === 1) {
                this.selectorText(<any>origin);
            }
        },
        evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
            if (event.eventName === 'expand') {
                const node = event.node;
            }
        },
    };

    /**
     * 路由参数
     */
    URLParams = {
        policyId: null,
        queryString: null,
    };

    ngOnInit() {
        this.initRouterParams();
        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                icon: 'left',
                text: '返回',
                type: 'event',
                event: () => this.router.navigate(['/client/policy/query/history']),
            },
            {
                text: '政策查询',
                type: 'event',
                event: () => this.router.navigate(['/client/policy/query/history']),
            },
            { type: 'text', text: '文档内容' },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.loadDocumentContent();
                this.loadPolicyFavoritesList();
            }
        });
    }

    /**
     * 功能按钮点击事件
     */
    evtConentOption({ type }) {
        switch (type) {
            case 'collect':
                this.collectDocument();
                break;
            case 'back':
                this.recoveryTable.load();
                break;
        }
    }

    /**
     * 加载政策内容
     */
    private loadDocumentContent() {
        this.service.getDocumentData(this.URLParams.policyId).subscribe(result => {
            this.policyInfoData = result;
            this.policyInfoData.contentHTML = this.sanitizer.bypassSecurityTrustHtml(
                this.policyInfoData.content
            );
            this.policyInfoData.fileList = result.attachmentInfos.map(item => {
                return <any>{
                    ...item,
                    thumbUrl: item.url,
                    name: item.fileName,
                    uid: item.id,
                };
            });
        });
    }

    /**
     * 注册右键事件
     */
    evtContextmenu(event: MouseEvent, template: NzDropdownMenuComponent) {
        event.preventDefault();
        const selection: Selection = getSelection();
        // 选中内容对象
        this.selectionIfy = {
            anchorNodeId: selection.anchorNode.parentElement.getAttribute('cy_mark'),
            anchorOffset: selection.anchorOffset,
            anchorIndex: this.getChildNodeIndex(selection.anchorNode),
            focusNodeId: selection.focusNode.parentElement.getAttribute('cy_mark'),
            focusOffset: selection.focusOffset,
            focusIndex: this.getChildNodeIndex(selection.focusNode),
        };
        const selectorText: string = selection.toString();
        if (selectorText.trim()) {
            // 选中内容
            this.signSelectorText = selectorText;
            // this.dropdown = this.nzDropdownService.create(event, template);
            this.NzContextService.create(event, template);
        }
    }

    /**
     * 获得selection对象在父元素的索引
     */
    private getChildNodeIndex(selectionNode: Node): number {
        const parentEl = selectionNode.parentElement;
        if (parentEl.childNodes && parentEl.childNodes.length > 0) {
            let _index = 0;
            parentEl.childNodes.forEach((node, index) => {
                if (selectionNode === node) {
                    _index = index;
                }
            });
            return _index;
        }
        return 0;
    }

    closeSignMenu(e?: NzMenuItemDirective): void {
        this.NzContextService.close();
    }

    /**
     * 菜单的右键事件
     * @param {MouseEvent} event
     */
    evtContextmenuTemp(event: MouseEvent) {
        event.preventDefault();
    }

    /**
     * 纠错反馈点击事件
     */
    evtCorrectiveFeedback() {
        this.closeSignMenu();
        this.recoveryTable.selectIndex = 0;
        this.recoveryError.form.enable();
        this.recoveryError.form.reset();
        this.recoveryError.open();
    }

    //#region 标记 笔记相关
    /**
     * 标记点击事件
     */
    evtSignSelectorText() {
        this.closeSignMenu();
        this.noteBook.form.reset();
        this.noteBook.form.patchValue({ documentNumber: this.policyInfoData.documentNumber });
        this.noteBook.open();
    }

    /**
     * 加载文档笔记
     */
    loadPolicyFavoritesList() {
        this.service.getPolicyFavoritesList(this.URLParams.policyId).subscribe(result => {
            if (result) {
                this.noteBook.list = result;
                this.notesify.nodes = result.map(item => {
                    const children = (item.tagInfos || []).map(v => {
                        return {
                            ...v,
                            title: v.tag,
                            key: v.id,
                            nodeType: 1,
                            isLeaf: true,
                        };
                    });

                    return {
                        ...item,
                        title: item.title,
                        key: item.noteId,
                        children: children || [],
                        nodeType: 0,
                        isLeaf: children.length === 0,
                    };
                });
            }
        });
    }

    /**
     * 设置选中文字，笔记树点击标记，定位文章标记位置
     */
    selectorText(selected: TagInfo) {
        const $anchorNode = this.documentRef.nativeElement.querySelectorAll(
            `[cy_mark="${selected.anchorNodeId}"]`
        );
        const $focusNode = this.documentRef.nativeElement.querySelectorAll(
            `[cy_mark="${selected.focusNodeId}"]`
        );
        if ($anchorNode.length > 0 && $focusNode.length > 0) {
            const selection = window.getSelection();
            const range = document.createRange();
            const anchorNode = $anchorNode[0].childNodes[selected.anchorIndex];
            const focusNode = $focusNode[0].childNodes[selected.focusIndex];
            // 定位滚动条
            this.documentRef.nativeElement.parentElement.scrollTop = $anchorNode[0].offsetTop - 50;
            range.setStart(anchorNode, selected.anchorOffset);
            range.setEnd(focusNode, selected.focusOffset);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    //#endregion

    /**
     * 收藏点击事件
     */
    collectDocument() {
        if (this.collect.classify.length === 0) {
            this.favoritesService
                .getfavoritesGroupAll()
                .subscribe(result => (this.collect.classify = result));
        }

        this.collect.form.setValue({
            favoritesName: this.policyInfoData.title,
            groupId: null,
        });
        this.collect.open();
    }
}
