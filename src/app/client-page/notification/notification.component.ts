import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Base64 } from 'js-base64';
import { NotificationService } from './notification.service';
import { SendNoticeTypeEnum_CN } from './db/enums/SendNoticeTypeEnum';
import { SendNoticeInfo } from './db/entity/SendNoticeInfo';
import { SendNoticeStatusEnum } from './db/enums/SendNoticeStatusEnum';
import { ReceiveNoticeStatusEnum_CN } from './db/enums/ReceiveNoticeStatusEnum';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
    private searchNotice = new Subject<string>();
    // tslint:disable-next-line:no-inferrable-types
    searchValue: string = '';
    loadingstatus: any = false;
    noticeTable = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
    };

    selectedTabIndex = 0;

    readingState = [
        { label: '未读', value: 0, checked: true },
        { label: '已读', value: 1, checked: true },
    ];
    untreated = {
        unFeedBack: null,
        unRead: null,
    };
    noticeOpinionify = {
        title: '通知阅读信息',
        width: 800,
        visible: false,
        tab: {
            nzSelectedIndex: 0,
            change: ({ index }) => {
                this.noticeOpinionify.tab.nzSelectedIndex = index;
                this.loadReadlyTableData(true);
            },
        },
        open: () => (this.noticeOpinionify.visible = true),
        close: () => (this.noticeOpinionify.visible = false),

        edit_noticeId: null,
        table: {
            content: [],
            page: 1,
            size: 10,
            totalElements: 0,
        },
    };
    mapOfExpandData: { [key: string]: boolean } = {};

    noticeTypeList = SendNoticeTypeEnum_CN;
    noticeStatusList = ReceiveNoticeStatusEnum_CN;

    readlyListify = {
        title: '通知反馈情况',
        width: 800,
        visible: false,
        open: () => (this.readlyListify.visible = true),
        close: () => (this.readlyListify.visible = false),

        tab: {
            selectedIndex: 0,
            change: ({ index }) => {
                this.readlyListify.tab.selectedIndex = index;
                this.readlyListify.table.content = [];
                this.loadOpinionTableData(true);
            },
        },

        row: <SendNoticeInfo>{},
        table: {
            content: [],
            page: 1,
            size: 10,
            totalElements: 0,
        },
    };
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    annexNotice = {
        visible: false,
        fileList: [],
        width: 500,
        open: () => {
            this.annexNotice.visible = true;
        },
        close: () => {
            this.annexNotice.visible = false;
        },
        form: new FormGroup({
            orgName: new FormControl(null),
            content: new FormControl(null),
        }),
        selectedIndex: 0,
        preview: (file: NzUploadFile) => {
            const _index = this.annexNotice.fileList.findIndex(x => x.url === file.url);
            this.annexNotice.selectedIndex = _index;
            this.onlineDocOverlayElement.show();
            return false;
        },
    };
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: NotificationService,
        private clientService: ClientService,
        private modalService: NzModalService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.searchNotice
            .pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(300),
                // ignore new term if same as previous term
                distinctUntilChanged()
            )
            .subscribe(searchKey => {
                this.loadNoticeData(true);
            });
        // this.loadNoticeData();
        this.initRouterParams();
        this.findUnReadAndUnFeedBack();
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '通知管理',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }
    annexNoticeInf(data) {
        this.annexNotice.open();
        this.annexNotice.form.patchValue(data);
        if (data.opinionAttachmentInfos) {
            this.annexNotice.fileList = data.opinionAttachmentInfos.map(item => {
                return <any>{
                    ...item,
                    thumbUrl: item.url,
                    name: item.fileName,
                    filename: item.fileName,
                    fileType: item.type,
                    fileId: item.url,
                };
            });
        }
    }
    /**
     * 解析参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // tslint:disable-next-line:radix
            this.selectedTabIndex = parseInt(params.get('selectedTabIndex') || '0');
            this.loadNoticeData();
        });
    }

    /**
     * 发布通知
     */
    addNotice() {
        this.router.navigate(['edit'], { relativeTo: this.activatedRoute });
    }

    searchNoticeData() {
        this.searchNotice.next(this.searchValue);
    }

    clearSearchValue() {
        this.searchValue = '';
        this.searchNotice.next(this.searchValue);
    }

    /**
     * 通知类型切换
     *
     * @param {*} event
     */
    nzSelectChange({ index }) {
        this.loadNoticeData(true);
    }

    loadNoticeData(reset: boolean = false): void {
        this.loadingstatus = false;
        if (reset) {
            this.noticeTable.page = 1;
        }
        const { page, size } = this.noticeTable;
        const status = Array.from(
            this.readingState.filter(v => v.checked),
            v => v.checked && v.value
        );
        this.service
            .getNoticeTable({
                page,
                size,
                status: status.join(','),
                keyword: this.searchValue,
                index: this.selectedTabIndex,
            })
            .subscribe(result => {
                // 添加标志
                if (result !== undefined) {
                    this.loadingstatus = true;
                }
                this.noticeTable = Object.assign(this.noticeTable, result);
            });
    }

    getNoticeTypeEN(value): string {
        return ((this.noticeTypeList || []).find(v => v.value === value) || <any>{}).text;
    }

    getNoticeStatusEN(value): string {
        return ((this.noticeStatusList || []).find(v => v.value === value) || <any>{}).text;
    }

    evtLoadOpinionList(row: SendNoticeInfo) {
        this.readlyListify.row = row;
        this.readlyListify.open();
        this.loadOpinionTableData();
        // this.noticeOpinionify.open();
    }

    evtLoadReadList(row: SendNoticeInfo) {
        this.noticeOpinionify.edit_noticeId = row.noticeId;
        this.noticeOpinionify.open();
        this.loadReadlyTableData();
    }
    /**
     * 已读未读
     */
    loadReadlyTableData(reset: boolean = false): void {
        if (reset) {
            this.noticeTable.page = 1;
        }
        const { page, size } = this.noticeOpinionify.table;
        this.service
            .getReadStatusList({
                noticeId: this.noticeOpinionify.edit_noticeId,
                status: this.noticeOpinionify.tab.nzSelectedIndex,
                page,
                size,
            })
            .subscribe(result => {
                if (result) {
                    this.noticeOpinionify.table = Object.assign(
                        this.noticeOpinionify.table,
                        result
                    );
                }
            });
    }
    /**
     * 反馈意见
     */
    loadOpinionTableData(reset: boolean = false): void {
        if (reset) {
            this.readlyListify.table.page = 1;
        }
        const { page, size } = this.readlyListify.table;
        this.service
            .getOpinionTable({
                page,
                size,
                noticeId: this.readlyListify.row.noticeId,
                type: this.readlyListify.tab.selectedIndex,
            })
            .subscribe(result => {
                if (result) {
                    result.content.forEach(v => {
                        v.fileList =
                            v.opinionAttachmentInfos &&
                            v.opinionAttachmentInfos.map(item => {
                                return <any>{
                                    ...item,
                                    thumbUrl: item.url,
                                    name: item.fileName,
                                    fileType: item.type,
                                    fileId: item.url,
                                };
                            });
                    });
                    this.readlyListify.table = Object.assign(this.readlyListify.table, result);
                }
            });
    }
    // 点击查看
    evtSelectorRow(row: SendNoticeInfo) {
        const data = {
            noticeId: row.noticeId,
            isEdit: row.status === SendNoticeStatusEnum.DRAFT,

            selectedTabIndex: this.selectedTabIndex,
        };
        const GL = Base64.encode(JSON.stringify(data));
        if (this.selectedTabIndex === 0) {
            this.router.navigate(['read', { GL }], { relativeTo: this.activatedRoute });
            return;
        }

        this.router.navigate(['edit', { GL }], { relativeTo: this.activatedRoute });
    }

    evtDeleteRow(row: SendNoticeInfo) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除: ${row.title} 通知吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deleteNoticeData(row.noticeId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除成功。');
                        this.loadNoticeData();
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }

    /**
     * 编辑查看通知
     */
    editNotification(data) {
        const GL = Base64.encode(JSON.stringify(data));
        this.router.navigate(['edit', { GL: GL }], { relativeTo: this.activatedRoute });
    }
    /**
     * 查找未读条目数和未反馈条目数
     */
    findUnReadAndUnFeedBack() {
        this.service.findUnReadAndUnFeedBack().subscribe(v => {
            this.untreated = v;
        });
    }
}
