import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import {
    NzFormatEmitEvent,
    NzTreeComponent,
    NzTreeNode,
    NzTreeNodeOptions,
} from 'ng-zorro-antd/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PolicyInfo } from '../db/entity/PolicyInfo';
import { PolicyStatusEnum, PolicyStatusEnum_List } from '../db/enum/PolicyStatusEnum';
import { SetClassificationService } from '../set-classification/set-classification.service';
import { MaintainService } from './maintain.service';
import { Base64 } from 'js-base64';

@Component({
    selector: 'app-maintain',
    templateUrl: './maintain.component.html',
    styleUrls: ['./maintain.component.scss'],
})
export class MaintainComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: MaintainService,
        private modalService: NzModalService,
        private message: NzMessageService,
        private setTypeService: SetClassificationService
    ) {}

    @ViewChild('typeTreeElement', { static: false }) _typeTreeElement: NzTreeComponent;

    /**
     * 政策信息状态列表
     */
    tabSetList = PolicyStatusEnum_List;
    tabSelectedIndex = 0;
    tabSelectedValue = 0;

    /**
     * 政策表格内容
     */
    policyTable = {
        content: [],
        page: 1,
        size: 10,
        totalElements: 0,
        selectorRow: <PolicyInfo>{},
    };

    readingState = [
        { label: '未处理', value: 'noHandle', checked: true },
        { label: '已处理', value: 'isHandle', checked: false },
    ];

    /**
     * 政策分类树内容
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
            this.loadPolicyList(true);
        },
    };

    /**
     * 作废信息抽屉内容
     */
    policyDrawer = {
        width: 460,
        visible: false,
        title: '作废信息填写',
        close: () => {
            this.policyDrawer.isDisabled = false;
            this.policyDrawer.visible = false;
        },
        open: () => (this.policyDrawer.visible = true),

        isDisabled: false,
        form: new FormGroup({
            content: new FormControl(null, Validators.required),
        }),
        // 保存作废信息
        save: () => {
            const { content } = this.policyDrawer.form.getRawValue();
            this.service
                .updatePolicyData(this.policyTable.selectorRow.policyId, content)
                .subscribe(isSucceed => {
                    if (isSucceed) {
                        this.policyDrawer.close();
                        this.message.success('成功作废。');
                        this.loadPolicyList();
                        this.loadTypeTreeData();
                    }
                });
        },
    };

    ngOnInit() {
        this.tabSetList = [
            ...this.tabSetList,
            {
                text: '反馈意见',
                value: -1,
            },
        ];
        this.loadTypeTreeData();

        // 面包屑
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
                icon: 'home',
                link: '/client/index',
            },
            {
                type: 'text',
                text: '政策查询',
            },
            {
                type: 'text',
                text: '政策维护',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 加载政策类型
     */
    loadTypeTreeData() {
        this.setTypeService.getPolicyAllCount().subscribe(result => {
            if (result) {
                // 类型树
                this.policyTypeTree.nodes = result;
                const [node] = result;
                if (node) {
                    this.policyTypeTree.nzSelectedKeys = node.key;
                    setTimeout(() => {
                        this.policyTypeTree.activedNode = this._typeTreeElement.getTreeNodeByKey(
                            node.key
                        );
                        this.loadPolicyList(true);
                    }, 100);
                }
            }
        });
    }

    // 发布政策
    publishPolicy() {
        this.router.navigate(['publish'], { relativeTo: this.activatedRoute });
    }

    // 选项卡切换
    evtTabSelectChange({ index }) {
        this.tabSelectedIndex = index;
        this.tabSelectedValue = this.tabSetList[this.tabSelectedIndex].value;
        this.loadPolicyList(true);
    }

    /**
     * 取政策类型下的政策数据
     */
    loadPolicyList(reset: boolean = false): void {
        if (reset) {
            this.policyTable.page = 1;
        }
        const { page, size } = this.policyTable;
        const flag = {};
        this.readingState.forEach(item => (flag[item.value] = item.checked));
        this.service
            .getPolicyDataList({
                page,
                size,
                ...flag,
                status: this.tabSelectedValue,
                groupId: this.policyTypeTree.activedNode.key,
            })
            .subscribe(result => {
                this.policyTable = Object.assign(this.policyTable, result);
            });
    }

    /**
     * 处理反馈意见事件
     */
    evtSelectorRow(row: PolicyInfo) {
        const data = {
            policyId: row.policyId,
            isEdit: row.status === PolicyStatusEnum.DRAFT || this.tabSelectedValue === -1,
        };
        const GL = Base64.encode(JSON.stringify(data));
        this.router.navigate(['publish', { GL }], { relativeTo: this.activatedRoute });
    }

    /**
     * 作废政策
     */
    evtUpdataRow(row: PolicyInfo) {
        this.policyTable.selectorRow = row;
        this.policyDrawer.form.enable();
        this.policyDrawer.form.reset();
        this.policyDrawer.open();
    }

    /**
     * 查看作废原因
     */
    evtInvalidInfo(row: PolicyInfo) {
        this.policyDrawer.isDisabled = true;
        this.policyDrawer.form.patchValue({ content: row.invalidReason });
        this.policyDrawer.form.disable();
        this.policyDrawer.open();
    }

    /**
     * 政策删除
     */
    evtDeleteRow(row: PolicyInfo) {
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除: ${row.title} 政策吗？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service.deletePolicyData(row.policyId).subscribe(isSucceed => {
                    if (isSucceed) {
                        this.message.success('删除成功。');
                        this.loadPolicyList();
                    }
                });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }
}
