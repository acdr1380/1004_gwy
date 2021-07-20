import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NoteInfo } from '../../db/entity/NoteInfo';
import { TagInfo } from '../../db/entity/TagInfo';
import { NotesService } from './notes.service';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private service: NotesService,
        private message: NzMessageService,
        private modalService: NzModalService
    ) {}

    /**
     * 标记表格
     */
    tagsTable = {
        totalElements: 0,
        size: 10,
        page: 1,
        content: [],
    };
    /**
     * 笔记列表内容
     */
    noteList = {
        data: <Array<NoteInfo>>[],
        /**
         * 笔记列表选中项
         */
        selectedItem: null,
        // 选中笔记
        evtSelect: (item: NoteInfo) => {
            this.noteList.selectedItem = item;
            this.service
                .getNotesTagsList(item.noteId)
                .subscribe(result => (this.tagsTable.content = result));
        },
        // 搜索框
        find: {
            searchWidth: 380,
            placeholder: '输入关键字查询笔记',
            nzFilterOption: () => true,
            searchKey: null,
            list: [],
            selectedIndex: -1,

            change: (value: string) => {
                this.noteList.selectedItem = this.noteList.data.find(v => v.noteId === value);
                this.noteList.evtSelect(this.noteList.selectedItem);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.noteList.find.list = this.noteList.data.filter(
                        v => v.title.indexOf(searchKey) > -1
                    );
                }
            },
        },
    };
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

        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            content: new FormControl(null, Validators.required),
            documentNumber: new FormControl(null),
            contentNote: new FormControl(null),
        }),
        /**
         * 是否编辑笔记
         */
        isEdit: false,
        edit_noteId: null,

        save: () => {
            if (this.commonService.formVerify(this.noteBook.form)) {
                const data = this.noteBook.form.getRawValue();
                // 编辑更新笔记内容
                if (this.noteBook.isEdit) {
                    data.noteId = this.noteBook.edit_noteId;
                    this.service.updateNoteData(data).subscribe(result => {
                        if (result) {
                            const index = this.noteList.data.findIndex(
                                v => v.noteId === result.noteId
                            );
                            this.noteList.data[index] = result;
                            this.noteList.selectedItem = result;
                            this.message.success('笔记信息更新成功。');
                            this.noteBook.close();
                        }
                    });
                    return;
                }
                // 添加保存笔记
                this.service.addNoteData(data).subscribe(result => {
                    if (result) {
                        this.noteList.data.push(result);
                        this.noteList.data = [...this.noteList.data];
                        this.message.success('笔记添加成功。');
                        this.noteBook.close();
                    }
                });
            }
        },
    };

    ngOnInit() {
        this.loadNotesData();
        // 设置面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                icon: 'left',
                text: '返回',
                type: 'event',
                event: () => this.router.navigate(['client/policy/query/history']),
            },
            {
                text: '政策查询',
                type: 'event',
                event: () => this.router.navigate(['client/policy/query/history']),
            },
            {
                type: 'text',
                text: '笔记',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 添加笔记
     */
    addNoteData() {
        this.noteBook.form.reset();
        this.noteBook.open();
    }

    /**
     * 加载所有笔记列表
     */
    loadNotesData(): void {
        this.service.getNotesAllList().subscribe(result => (this.noteList.data = result));
    }

    /**
     * 笔记编辑
     */
    editNoteData(row: NoteInfo) {
        this.noteBook.isEdit = true;
        this.noteBook.edit_noteId = row.noteId;
        this.noteBook.form.patchValue(row);
        this.noteBook.open();
    }

    deleteTag(row: TagInfo) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除标记吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deleteTagData(row.tagId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除标记成功。');
                        const index = this.tagsTable.content.findIndex(v => v.tagId === row.tagId);
                        this.tagsTable.content.splice(index, 1);
                        this.tagsTable.content = [...this.tagsTable.content];
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }

    deleteNoteData(row: NoteInfo) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除笔记：${row.title} 吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deleteNoteData(row.noteId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除笔记成功。');
                        const index = this.noteList.data.findIndex(v => v.noteId === row.noteId);
                        this.noteList.data.splice(index, 1);
                        this.noteList.data = [...this.noteList.data];
                        this.noteList.selectedItem = null;
                        this.tagsTable.content = [];
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }
}
