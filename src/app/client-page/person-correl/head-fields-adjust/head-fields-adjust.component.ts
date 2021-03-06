import { HeadFieldsAdjustService } from './head-fields-adjust.service';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonService } from 'app/util/common.service';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-head-fields-adjust',
    templateUrl: './head-fields-adjust.component.html',
    styleUrls: ['./head-fields-adjust.component.scss'],
})
export class HeadFieldsAdjustComponent implements OnInit {
    /**
     * 字段调整所需界面方案标识
     */
    @Input() headPermission = 'user_defined_list_fields';
    /**
     * 用户保存方案枚举
     */
    @Input() userParameterType: UserParameterTypeEnum =
        UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL;

    @Output() updateChange = new EventEmitter<any>();

    // 当前账号信息
    sessionUser = this.commonService.getUserLoginInfo();

    /**
     * 调整字段相关内容
     */
    headFieldsAdjustIfy = {
        title: '选择显示列',
        visible: false,
        width: 800,

        close: () => (this.headFieldsAdjustIfy.visible = false),
        open: () => (this.headFieldsAdjustIfy.visible = true),

        searchValue: null,
        // 备选字段
        alternativeTree: {
            nodes: [],
            icons: ['tags', 'shield'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.headFieldsAdjustIfy.alternativeTree.activedNode = data.node;
                }
            },
            evtDblActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.headFieldsAdjustIfy.alternativeTree.activedNode = data.node;
                    this.headFieldsAdjustIfy.evtChoose();
                }
            },
        },

        evtChoose: () => {
            if (!this.headFieldsAdjustIfy.alternativeTree.activedNode.key) {
                return;
            }

            const { origin } = this.headFieldsAdjustIfy.alternativeTree.activedNode;
            const index = this.headFieldsAdjustIfy.selectedIfy.list.findIndex(
                v => v.TABLE_COLUMN_CODE === origin.TABLE_COLUMN_CODE
            );
            if (index === -1) {
                this.headFieldsAdjustIfy.selectedIfy.list.push(origin);
            }
        },

        selectedIfy: {
            list: <any>[],
            drop: (event: CdkDragDrop<any[]>) => {
                event.previousIndex += 1;
                event.currentIndex += 1;
                if (event.previousIndex === event.currentIndex) {
                    return;
                }
                moveItemInArray(
                    this.headFieldsAdjustIfy.selectedIfy.list,
                    event.previousIndex,
                    event.currentIndex
                );
            },

            delete: (item, index: number) => {
                this.headFieldsAdjustIfy.selectedIfy.list.splice(index, 1);
            },
        },

        save: () => {
            if (this.headFieldsAdjustIfy.selectedIfy.list.length === 0) {
                this.updateChange.emit([]);
                // 未选字段则删除用户参数
                this.service
                    .deleteParameterdata({
                        USER_PARAMETER_USER_ID: this.sessionUser.userId,
                        USER_PARAMETER_TYPE: this.userParameterType,
                    })
                    .subscribe(result => {
                        this.headFieldsAdjustIfy.close();
                    });
                return;
            }
            const data = {
                USER_PARAMETER_USER_ID: this.sessionUser.userId,
                USER_PARAMETER_NAME: '人员管理-显示字段调整',
                USER_PARAMETER_TYPE: this.userParameterType,
                USER_PARAMETER_VALUE: this.headFieldsAdjustIfy.selectedIfy.list
                    .map(v => v.TABLE_COLUMN_CODE)
                    .join(','),
            };
            this.service.saveParameterData(data).subscribe(result => {
                this.updateChange.emit(this.headFieldsAdjustIfy.selectedIfy.list);
                this.headFieldsAdjustIfy.close();
            });
        },
    };

    constructor(
        private service: HeadFieldsAdjustService,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    ngOnInit() {}

    //#region 显示字段调整

    /**
     * 加载账号保存字段
     */
    private loadUserFields() {
        const data = {
            USER_PARAMETER_USER_ID: this.sessionUser.userId,
            USER_PARAMETER_TYPE: this.userParameterType,
            SCHEME_PERMISSION: this.headPermission,
        };
        this.service.getParameterData(data).subscribe(result => {
            this.headFieldsAdjustIfy.selectedIfy.list = result;
            if (result.length === 0) {
                this.headFieldsAdjustIfy.selectedIfy.list = [
                    {
                        TABLE_COLUMN_CODE: 'A0101',
                        SCHEME_HEADER_DISPLAY_NAME: '姓名',
                    },
                ];
            }
        });
    }

    /**
     * 调整字段显示
     */
    private loadfieldsAdjust() {
        // if (this.headFieldsAdjustIfy.alternativeTree.nodes.length > 0) {
        //     return;
        // }
        this.commonService.getSchemeContent(this.headPermission).subscribe(result => {
            const nodes = [];
            this.buildFieldsTreeData(result, nodes);
            this.headFieldsAdjustIfy.alternativeTree.nodes = nodes;
        });
    }

    /**
     * 根据界面方案字段构造树形结构
     *
     * @param {SysPageSchemeVO} data 界面方案
     * @param {any[]} nodes 树
     * @memberof PersonmgrComponent
     */
    private buildFieldsTreeData(data: any, nodes: any[]) {
        data.systemSchemeList.forEach(item => {
            const node = {
                title: item.systemSchemeTable.SCHEME_TABLE_DISPLAY_NAME,
                key: item.systemSchemeTable.SCHEME_TABLE_TABLE_ID,
                isLeaf: item.systemSchemeHeader.length === 0,
                children: [],
                nodeType: 0,
                disabled: true,
                icon: 'tags',
            };

            item.systemSchemeHeader.forEach(field => {
                node.children.push({
                    ...field,
                    title: field.SCHEME_HEADER_DISPLAY_NAME,
                    key: field.SCHEME_HEADER_COLUMN_ID,
                    isLeaf: true,
                    nodeType: 1,
                    icon: 'file',
                });
            });
            nodes.push(node);
        });
    }
    //#endregion

    /**
     * 显示字段调整
     */
    show() {
        this.loadUserFields();
        this.loadfieldsAdjust();
        this.headFieldsAdjustIfy.open();
    }
}
