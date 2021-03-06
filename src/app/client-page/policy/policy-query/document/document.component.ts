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
     * ????????????
     */
    feedBackEnumList = FeedBackEnumList;
    /**
     * ????????????
     */
    operationBtnGroup = [
        {
            text: '??????',
            icon: 'star-half-o',
            type: 'collect',
        },
        {
            text: '????????????',
            icon: 'comments-o',
            type: 'back',
        },
    ];

    /**
     * ???????????????
     */
    policyInfoData: PolicyInfo = <PolicyInfo>{};
    /**
     * ????????????
     */
    signSelectorText = '';
    /**
     * ??????????????????
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
     * ??????????????????????????????
     */
    recoveryError = {
        title: '????????????',
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
         * ?????????????????????????????????
         */
        isEdit: false,
        edit_backId: null,

        save: () => {
            if (this.commonService.formVerify(this.recoveryError.form)) {
                const data = this.recoveryError.form.getRawValue();
                // ?????????????????????????????????
                if (this.recoveryError.isEdit) {
                    data.backId = this.recoveryError.edit_backId;
                    this.service.updateBackData(data).subscribe(result => {
                        if (result) {
                            const index = this.recoveryTable.dataAll.findIndex(
                                v => v.backId === result.backId
                            );
                            this.recoveryTable.dataAll[index] = result;
                            this.recoveryTable.filterState();
                            this.message.success('?????????????????????');
                            this.recoveryError.close();
                        }
                    });
                    return;
                }
                // ????????????????????????
                data.policyId = this.URLParams.policyId;
                data.chooseContent = this.signSelectorText;
                this.service.saveBackData(data).subscribe(result => {
                    if (result) {
                        this.message.success('??????????????????');
                        this.recoveryError.close();
                    }
                });
            }
        },
    };

    /**
     * ????????????????????????
     */
    recoveryTable = {
        title: '????????????',
        width: 600,
        visible: false,
        open: () => (this.recoveryTable.visible = true),
        close: () => (this.recoveryTable.visible = false),
        // ????????????
        tabset: FeedBackOperationEnumList,
        selectIndex: 0,
        evtSelectChange: event => {
            this.recoveryTable.filterState();
        },
        data: [],
        dataAll: [],
        /**
         * ?????????????????????
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
         * ??????????????????
         */
        getTypeEn: value => {
            const item = this.feedBackEnumList.find(v => v.value === value);
            return item ? item.text : '';
        },

        // ?????????????????????????????????
        edit: (row: BackInfo) => {
            this.signSelectorText = row.chooseContent;
            this.recoveryError.isEdit = true;
            this.recoveryError.edit_backId = row.backId;
            this.recoveryError.form.patchValue(row);
            // ??????????????????????????????????????????
            if (this.recoveryTable.selectIndex === 1) {
                this.recoveryError.form.disable();
            } else {
                this.recoveryError.form.enable();
            }
            this.recoveryError.open();
        },
        // ???????????????
        delete: (row: BackInfo) => {
            this.modalService.confirm({
                nzTitle: `????????????`,
                nzContent: `<b style="color: red;">???????????????????????????</b>`,
                nzOkText: '??????',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service.deleteBackData(row.backId).subscribe(isSucceed => {
                        if (isSucceed) {
                            this.message.success('???????????????');
                            const index = this.recoveryTable.dataAll.findIndex(
                                v => v.backId === row.backId
                            );
                            this.recoveryTable.dataAll.splice(index, 1);
                            this.recoveryTable.filterState();
                        }
                    });
                },
                nzCancelText: '??????',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    @ViewChild('scrollCollectList', { static: false })
    private _scrollCollectList: CdkVirtualScrollViewport;
    /**
     * ??????????????????
     */
    collect = {
        title: '????????????',
        width: 500,
        visible: false,
        open: () => (this.collect.visible = true),
        close: () => (this.collect.visible = false),
        /**
         * ????????????
         */
        classify: [],
        form: new FormGroup({
            favoritesName: new FormControl(null, Validators.required),
            groupId: new FormControl(null, Validators.required),
        }),
        // ????????????
        addGroup: () => this.collect.group.open(),
        // ??????????????????
        save: () => {
            if (this.commonService.formVerify(this.collect.form)) {
                const data = this.collect.form.getRawValue();
                data.policyId = this.URLParams.policyId;
                this.favoritesService.saveFavoritesData(data).subscribe(result => {
                    if (result) {
                        this.message.success('?????????????????????');
                        this.collect.close();
                    }
                });
            }
        },

        /**
         * ????????????????????????
         */
        groupEdit: {
            width: 300,
            visible: false,
            title: '????????????',
            close: () => (this.collect.groupEdit.visible = false),
            open: () => (this.collect.groupEdit.visible = true),
            form: new FormGroup({
                groupName: new FormControl(null, Validators.required),
            }),
            // ??????????????????
            save: () => {
                if (this.commonService.formVerify(this.collect.groupEdit.form)) {
                    const data = this.collect.groupEdit.form.getRawValue();
                    this.favoritesService.saveFavoritesGroupData(data).subscribe(result => {
                        if (result) {
                            this.collect.classify.push(result);
                            this.collect.classify = [...this.collect.classify];
                            this.message.success('?????????????????????');
                            this.collect.groupEdit.close();
                        }
                    });
                }
            },
        },

        /*
         * ????????????????????????
         */
        group: {
            width: 400,
            visible: false,
            title: '????????????',
            close: () => (this.collect.group.visible = false),
            open: () => (this.collect.group.visible = true),

            list: [],
            selectSetDB: null,
            // ????????????
            selected: index => {
                this.collect.group.selectedIndex = index;
                this.collect.group.selectSetDB = this.collect.group.list[index];
            },
            selectedIndex: -1,
            // ?????????
            find: {
                searchWidth: 260,
                placeholder: '???????????????????????????',
                nzFilterOption: () => true,
                searchList: [],
                searchKey: null,
                list: [],
                change: (value: string) => {
                    const index = this.collect.classify.findIndex(item => item.groupId === value);
                    this.collect.group.selectedIndex = index;
                    // ????????????
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
            // ???????????????????????????
            add: () => {
                this.collect.groupEdit.form.reset();
                this.collect.groupEdit.open();
            },
            // ????????????
            edit: () => {
                this.collect.groupEdit.form.patchValue({
                    groupName: this.collect.classify[this.collect.group.selectedIndex].groupName,
                });
                this.collect.groupEdit.open();
            },
            // ????????????
            delete: index => {
                this.modalService.confirm({
                    nzTitle: `????????????`,
                    nzContent: `<b style="color: red;">??????????????????${this.collect.classify[index].groupName} ????????????</b>`,
                    nzOkText: '??????',
                    nzOkType: 'danger',
                    nzOnOk: () => {
                        this.favoritesService
                            .deleteFavoritesGroup(this.collect.classify[index].groupId)
                            .subscribe(isSucceed => {
                                if (isSucceed) {
                                    this.message.success('???????????????');
                                    this.collect.classify.splice(index, 1);
                                    this.collect.classify = [...this.collect.classify];
                                }
                            });
                    },
                    nzCancelText: '??????',
                    nzOnCancel: () => console.log('Cancel'),
                });
            },
        },
    };

    @ViewChild('noteBookExistIfyList', { static: false })
    private _noteBookExistIfyList: CdkVirtualScrollViewport;
    @ViewChild('notesTreeElement', { static: false }) private _notesTreeElement: NzTreeComponent;
    /**
     * ??????????????????
     */
    noteBook = {
        title: '????????????',
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
        // ??????????????????
        save: () => {
            // ??????????????????
            if (this.noteBook.isRelevance) {
                this.service
                    .saveTagData({
                        ...this.selectionIfy,
                        noteId: this.noteBook.edit_noteId,
                        tag: this.signSelectorText,
                    })
                    .subscribe(result => {
                        if (result) {
                            this.message.success('?????????????????????');
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
            // ?????????????????????
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
                        this.message.success('?????????????????????');
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
        // ??????????????????
        selectedExist: () => {
            this.noteBook.existIfy.open();
        },
        /**
         * ??????????????????
         */
        isRelevance: false,
        reset: () => {
            this.noteBook.form.enable({ onlySelf: true });
            this.noteBook.isRelevance = false;
            this.noteBook.form.reset();
        },

        /**
         * ????????????????????????
         */
        existIfy: {
            width: 360,
            visible: false,
            title: '????????????',
            close: () => (this.noteBook.existIfy.visible = false),
            open: () => (this.noteBook.existIfy.visible = true),
            selected: index => (this.noteBook.existIfy.selectedIndex = index),
            selectedIndex: -1,

            // ?????????
            find: {
                searchWidth: 260,
                placeholder: '???????????????????????????',
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

            // ??????????????????
            evtSelected: () => {
                if (this.noteBook.existIfy.selectedIndex === -1) {
                    this.message.error('??????????????????');
                    return;
                }
                // ????????????????????????
                this.noteBook.form.disable({ onlySelf: true });
                this.noteBook.form.patchValue(
                    this.noteBook.list[this.noteBook.existIfy.selectedIndex]
                );
                this.noteBook.edit_noteId = this.noteBook.list[
                    this.noteBook.existIfy.selectedIndex
                ].noteId;
                // ??????????????????
                this.noteBook.isRelevance = true;
                this.noteBook.existIfy.close();
            },
        },
    };

    /**
     * ???????????????
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
     * ????????????
     */
    URLParams = {
        policyId: null,
        queryString: null,
    };

    ngOnInit() {
        this.initRouterParams();
        // ???????????????
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                icon: 'left',
                text: '??????',
                type: 'event',
                event: () => this.router.navigate(['/client/policy/query/history']),
            },
            {
                text: '????????????',
                type: 'event',
                event: () => this.router.navigate(['/client/policy/query/history']),
            },
            { type: 'text', text: '????????????' },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * ??????????????????
     */
    initRouterParams() {
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // ??????????????????????????????
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.loadDocumentContent();
                this.loadPolicyFavoritesList();
            }
        });
    }

    /**
     * ????????????????????????
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
     * ??????????????????
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
     * ??????????????????
     */
    evtContextmenu(event: MouseEvent, template: NzDropdownMenuComponent) {
        event.preventDefault();
        const selection: Selection = getSelection();
        // ??????????????????
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
            // ????????????
            this.signSelectorText = selectorText;
            // this.dropdown = this.nzDropdownService.create(event, template);
            this.NzContextService.create(event, template);
        }
    }

    /**
     * ??????selection???????????????????????????
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
     * ?????????????????????
     * @param {MouseEvent} event
     */
    evtContextmenuTemp(event: MouseEvent) {
        event.preventDefault();
    }

    /**
     * ????????????????????????
     */
    evtCorrectiveFeedback() {
        this.closeSignMenu();
        this.recoveryTable.selectIndex = 0;
        this.recoveryError.form.enable();
        this.recoveryError.form.reset();
        this.recoveryError.open();
    }

    //#region ?????? ????????????
    /**
     * ??????????????????
     */
    evtSignSelectorText() {
        this.closeSignMenu();
        this.noteBook.form.reset();
        this.noteBook.form.patchValue({ documentNumber: this.policyInfoData.documentNumber });
        this.noteBook.open();
    }

    /**
     * ??????????????????
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
     * ?????????????????????????????????????????????????????????????????????
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
            // ???????????????
            this.documentRef.nativeElement.parentElement.scrollTop = $anchorNode[0].offsetTop - 50;
            range.setStart(anchorNode, selected.anchorOffset);
            range.setEnd(focusNode, selected.focusOffset);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    //#endregion

    /**
     * ??????????????????
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
