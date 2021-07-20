import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import {
    NzFormatEmitEvent,
    NzTreeComponent,
    NzTreeNode,
    NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NoteInfo } from '../../db/entity/NoteInfo';
import { PolicyInfo } from '../../db/entity/PolicyInfo';
import { PolicyInvalidEnum } from '../../db/enum/PolicyInvalidEnum';
import { FavoritesService } from '../favorites/favorites.service';
import { NotesService } from '../notes/notes.service';
import { HistoryService } from './history.service';
import { Base64 } from 'js-base64';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private service: HistoryService,
        private commonService: CommonService,
        private notesService: NotesService,
        private message: NzMessageService,
        private modalService: NzModalService,
        private favoritesService: FavoritesService
    ) {}

    @ViewChild('typeTreeElement', { static: false }) _typeTreeElement: NzTreeComponent;
    /**
     * 笔记抽屉相关
     */
    noteBook = {
        title: '增加笔记',
        width: 500,
        visible: false,
        open: () => (this.noteBook.visible = true),
        close: () => {
            this.noteBook.isEdit = false;
            this.noteBook.visible = false;
        },
        /**
         * 笔记总数居
         */
        data: [],
        // 新增笔记表单
        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            documentNumber: new FormControl(null),
            contentNote: new FormControl(null),
        }),
        /**
         * 是否编辑笔记内容
         */
        isEdit: false,
        /**
         * 笔记编码
         */
        edit_noteId: null,

        // 笔记保存
        save: () => {
            if (this.commonService.formVerify(this.noteBook.form)) {
                const data = this.noteBook.form.getRawValue();
                // 判断是否编辑笔记，编辑-更新
                if (this.noteBook.isEdit) {
                    // 保存笔记编码
                    data.noteId = this.noteBook.edit_noteId;
                    this.notesService.updateNoteData(data).subscribe(result => {
                        if (result) {
                            this.message.success('笔记信息更新成功。');
                            const _index = this.noteBook.data.findIndex(
                                v => v.noteId === result.noteId
                            );
                            this.noteBook.data[_index] = result;
                            this.noteBook.data = [...this.noteBook.data];
                            this.noteBook.close();
                        }
                    });
                    return;
                }
                // 新增保存笔记内容
                this.notesService.addNoteData(data).subscribe(result => {
                    if (result) {
                        this.message.success('笔记添加成功。');
                        this.noteBook.close();
                        this.noteBook.data.splice(0, 0, result);
                        this.noteBook.data = [...this.noteBook.data];
                    }
                });
            }
        },
    };
    /**
     * 收藏区域相关
     */
    favoritesIfy = {
        nodes: [],
        nodeIconFile: 'file-o',
        nodeIconFolder: 'folder-o',
        nodeIconFolderOpen: 'folder-open-o',
        activedNode: <NzTreeNode>{},
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.favoritesIfy.activedNode = data.node;
            const { origin } = data.node;
            // 判断选中节点类型
            if (origin.invalidEnum === 1) {
                return;
            }
            // 选中收藏文件
            if (origin.nodeType === 1) {
                this.evtLoadDocContent(<any>origin);
            }
        },
        evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
            if (event.eventName === 'expand') {
                const node = event.node;

                if (node && node.getChildren().length === 0 && node.isExpanded) {
                    this.favoritesService
                        .getfavoritesFileList(node.key)
                        .subscribe(children => node.addChildren(children));
                }
            }
        },
    };
    /**
     * 文号相关
     */
    frequentlyRefer = {
        data: [],
    };
    /**
     * 系统动态
     */
    SysDynamic = {
        data: [],
    };
    /**
     * 政策类型树
     */
    policyTypeTree = {
        nodes: [] as NzTreeNodeOptions[],
        nzSelectedKeys: [],
        nzExpandedKeys: [],
        activedNode: <NzTreeNode>{},
        icons: ['sitemap', 'server', 'building-o'],
        expandChange: (event: Required<NzFormatEmitEvent>) => {
            if (event.eventName === 'expand') {
                const node = event.node;
            }
        },
        isType: false,
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.policyTypeTree.activedNode = data.node;
            this.policyTypeTree.isType = true;
            this.loadSearchPolicyData(true);
        },
    };
    /**
     * 政策数据表格
     */
    policyTable = {
        content: [],
        page: 1,
        size: 5,
        totalElements: 0,
    };
    queryString = '';
    searchType = [];

    ngOnInit() {
        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
                icon: 'home',
                link: '/client/index',
            },
            // {
            //     type: 'text',
            //     text: '政策查询',
            // },
            {
                type: 'text',
                text: '政策查询',
            },
        ]);

        this.loadNotesData();
        this.loadFavoritesTree();
        this.loadFrequentlyRefer();
        this.loadTypeTreeData();
        this.loadSysDynamicStateData();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    //#region 笔记
    /**
     *加载笔记数据
     */
    loadNotesData() {
        this.notesService.getNotesCountList(7).subscribe(data => (this.noteBook.data = data));
    }

    /**
     * 增加笔记
     */
    addNoteBook() {
        this.noteBook.title = '增加笔记';
        this.noteBook.form.reset();
        this.noteBook.open();
    }

    /**
     * 编辑笔记
     */
    editNoteBook(item: NoteInfo) {
        if (item.invalidEnum === PolicyInvalidEnum.ISINVALID) {
            return;
        }
        this.noteBook.title = '编辑笔记';
        this.noteBook.isEdit = true;
        this.noteBook.edit_noteId = item.noteId;
        this.noteBook.form.patchValue(item);
        this.noteBook.open();
    }

    /**
     * 笔记更多
     */
    noteBookMore() {
        this.router.navigate(['notes'], { relativeTo: this.activatedRoute.parent });
    }
    //#endregion

    /**
     * 收藏更多
     */
    enshrineMore() {
        this.router.navigate(['favorites'], { relativeTo: this.activatedRoute.parent });
    }

    /**
     * 更多
     */
    systemPromptMore() {}

    /**
     * 加载常用文号
     */
    loadFrequentlyRefer() {
        this.service.findByHits().subscribe(data => (this.frequentlyRefer.data = data));
    }

    /**
     * 收藏文件详细信息界面跳转
     */
    evtLoadDocContent(data: PolicyInfo) {
        const GL = Base64.encode(
            JSON.stringify({
                policyId: data.policyId,
            })
        );
        this.router.navigate(['/client/policy/query/document', { GL: GL }]);
    }

    /**
     * 取收藏分组
     */
    loadFavoritesTree() {
        this.favoritesService
            .getfavoritesGroupNodes()
            .subscribe(nodes => (this.favoritesIfy.nodes = nodes));
    }

    /**
     * 系统动态
     */
    loadSysDynamicStateData() {
        this.service
            .getSysDynamicStateList(10)
            .subscribe(result => (this.SysDynamic.data = result));
    }

    /**
     * 加载对应类型政策数据
     */
    loadSearchPolicyData(reset: boolean = false): void {
        if (reset) {
            this.policyTable.page = 1;
        }
        const { page, size } = this.policyTable;
        const keyword = this.queryString;
        const type = this.searchType
            .filter(v => v.checked)
            .map(v => v.value)
            .join(',');
        const data = {
            page,
            size,
            keyword,
            type,
            isType: this.policyTypeTree.isType,
            groupId: this.policyTypeTree.activedNode.key,
        };
        this.service.searchPolicyInfo(data).subscribe(result => {
            this.policyTable = Object.assign(this.policyTable, result);
        });
    }

    /**
     * 取政策类型统计数量
     */
    loadTypeTreeData() {
        this.service.getPolicyTypeAllCount().subscribe(result => {
            if (result && result.length > 0) {
                this.policyTypeTree.nodes = result;
                this.policyTypeTree.activedNode.key = this.policyTypeTree.nodes[0].key;
                this.policyTypeTree.isType = true;
                this.loadSearchPolicyData();
            }
        });
    }

    /**
     * 跳转政策详细信息界面
     */
    evtSelectorRow(data: PolicyInfo) {
        const GL = Base64.encode(
            JSON.stringify({
                policyId: data.policyId,
                queryString: this.queryString,
            })
        );
        this.router.navigate(['/client/policy/query/document', { GL: GL }]);
    }
}
