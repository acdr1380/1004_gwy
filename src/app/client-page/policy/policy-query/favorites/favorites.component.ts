import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { FavoritesGroup } from '../../db/entity/FavoritesGroup';
import { FavoritesInfo } from '../../db/entity/FavoritesInfo';
import { FavoritesService } from './favorites.service';

@Component({
    selector: 'app-favorites',
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private service: FavoritesService,
        private commonService: CommonService,
        private message: NzMessageService,
        private modalService: NzModalService,
        private router: Router
    ) {}

    /**
     * 收藏分类相关
     */
    favoritesList = {
        data: [],
        /**
         * 分类选中项
         */
        selectedItem: null,
        // 分类选中事件
        evtSelect: (item: FavoritesGroup) => {
            this.favoritesList.selectedItem = item;
            this.service
                .getfavoritesFileList(item.groupId)
                .subscribe(result => (this.favoritesTable.content = result));
        },
        // 搜索框
        find: {
            searchWidth: 380,
            placeholder: '输入关键字查询分类',
            nzFilterOption: () => true,
            searchKey: null,
            list: [],
            selectedIndex: -1,

            change: (value: string) => {
                this.favoritesList.selectedItem = this.favoritesList.data.find(
                    v => v.groupId === value
                );
                this.favoritesList.evtSelect(this.favoritesList.selectedItem);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.favoritesList.find.list = this.favoritesList.data.filter(
                        v => v.groupName.indexOf(searchKey) > -1
                    );
                }
            },
        },
    };

    /**
     * 收藏文件表格
     */
    favoritesTable = {
        totalElements: 0,
        size: 10,
        page: 1,
        content: [],
    };

    /**
     * 添加分类抽屉内容
     */
    favoritesGroup = {
        title: '收藏分组信息',
        width: 400,
        visible: false,
        open: () => (this.favoritesGroup.visible = true),
        close: () => {
            this.favoritesGroup.isEdit = false;
            this.favoritesGroup.visible = false;
        },
        isEdit: false,
        edit_groupId: null,
        form: new FormGroup({
            groupName: new FormControl(null, Validators.required),
        }),

        save: () => {
            if (this.commonService.formVerify(this.favoritesGroup.form)) {
                const data = this.favoritesGroup.form.getRawValue();
                if (this.favoritesGroup.isEdit) {
                    // 编辑收藏分组，更新数据
                    data.groupId = this.favoritesGroup.edit_groupId;
                    this.service.updateFavoritesGroupData(data).subscribe(result => {
                        if (result) {
                            const index = this.favoritesList.data.findIndex(
                                v => v.groupId === result.groupId
                            );
                            this.favoritesList.data[index] = result;
                            this.message.success('收藏分组更新成功。');
                            this.favoritesGroup.close();
                        }
                    });
                    return;
                }
                // 添加分类
                this.service.saveFavoritesGroupData(data).subscribe(result => {
                    if (result) {
                        this.favoritesList.data.push(result);
                        this.favoritesList.data = [...this.favoritesList.data];
                        this.message.success('增加分组成功。');
                        this.favoritesGroup.close();
                    }
                });
            }
        },
    };

    ngOnInit() {
        this.loadFavoritesData();
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
                text: '收藏',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载收藏分组列表
     */
    loadFavoritesData() {
        this.service.getfavoritesGroupAll().subscribe(result => (this.favoritesList.data = result));
    }

    /**
     * 添加分类
     */
    addFavoritesGroup() {
        this.favoritesGroup.form.reset();
        this.favoritesGroup.open();
    }

    /**
     * 编辑分类信息
     */
    editFavoriteGroup(row: FavoritesGroup) {
        this.favoritesGroup.isEdit = true;
        this.favoritesGroup.edit_groupId = row.groupId;
        this.favoritesGroup.form.patchValue(row);
        this.favoritesGroup.open();
    }

    deleteFavoriteGroup(row: FavoritesGroup) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除分类：${row.groupName} 吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deleteFavoritesGroup(row.groupId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除分类成功。');
                        const index = this.favoritesList.data.findIndex(
                            v => v.groupId === row.groupId
                        );
                        this.favoritesList.data.splice(index, 1);
                        this.favoritesList.data = [...this.favoritesList.data];
                        this.favoritesList.selectedItem = null;
                        this.favoritesTable.content = [];
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }

    deleteFavoriteData(row: FavoritesInfo) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除收藏文件：${row.favoritesName} 吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deleteFavoritesData(row.favoritesId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('收藏文件删除成功。');
                        const index = this.favoritesTable.content.findIndex(
                            v => v.favoritesId === row.favoritesId
                        );
                        this.favoritesTable.content.splice(index, 1);
                        this.favoritesTable.content = [...this.favoritesTable.content];
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }
}
