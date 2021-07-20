import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
    NzTreeComponent,
    NzTreeNode,
    NzTreeNodeOptions,
    NzFormatEmitEvent,
} from 'ng-zorro-antd/tree';
import { SetClassificationService } from './set-classification.service';

@Component({
    selector: 'app-set-classification',
    templateUrl: './set-classification.component.html',
    styleUrls: ['./set-classification.component.scss'],
})
export class SetClassificationComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private commonService: CommonService,
        private service: SetClassificationService,
        private message: NzMessageService,
        private modalService: NzModalService
    ) {}

    /**
     * 添加类型抽屉内容
     */
    policyTypeify = {
        width: 300,
        visible: false,
        title: '分组节点信息',
        close: () => {
            this.policyTypeify.isEdit = false;
            this.policyTypeify.visible = false;
        },
        open: () => (this.policyTypeify.visible = true),

        form: new FormGroup({
            groupName: new FormControl(null, Validators.required),
            isTop: new FormControl(null), // 是否顶层
            topNodeId: new FormControl(null),
            topNodeName: new FormControl({ value: null, disabled: true }),
        }),
        /**
         * 是否编辑政策类型
         */
        isEdit: false,
        save: () => {
            if (this.commonService.formVerify(this.policyTypeify.form)) {
                const data = this.policyTypeify.form.getRawValue();
                // 编辑更新分类信息，添加保存分类
                if (this.policyTypeify.isEdit) {
                    data.groupId = this.policyTypeTree.activedNode.key;
                    this.service.updatePolicyTypeData(data).subscribe(result => {
                        if (result) {
                            this.policyTypeTree.activedNode.origin = result;
                            this.policyTypeTree.activedNode.title = result.title;
                            this.message.success('更新成功。');
                            this.policyTypeify.close();
                        }
                    });
                    return;
                }

                data.parentId = data.isTop ? '-1' : data.topNodeId;
                this.service.savePolicyTypeData(data).subscribe(result => {
                    if (result) {
                        // 是否顶层节点
                        if (data.isTop) {
                            this.policyTypeTree.nodes.push(result);
                            this.policyTypeTree.nodes = [...this.policyTypeTree.nodes];
                        } else {
                            const node = this._typeTreeElement.getTreeNodeByKey(
                                this.policyTypeTree.activedNode.key
                            );
                            node.isLeaf = false;
                            node.addChildren([result]);
                            node.title = node.title;
                        }
                        this.message.success('保存成功。');
                        this.policyTypeify.close();
                    }
                });
            }
        },
    };

    @ViewChild('typeTreeElement', { static: false }) private _typeTreeElement: NzTreeComponent;
    /**
     * 分类树内容
     */
    policyTypeTree = {
        // 搜索框
        find: {
            searchWidth: 280,
            placeholder: '输入政策分类关键字',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,
            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                const nodes = this._typeTreeElement.getTreeNodes();
                const list = [];
                this.getTreeNodesAll(nodes, list);
                const parentsList = [];
                const node = this._typeTreeElement.getTreeNodeByKey(value);
                this.getNodeParentsAll(list, node, parentsList);
                this.policyTypeTree.nzExpandedKeys = parentsList.map(v => v.key);
                this.policyTypeTree.activedNode = node;
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    const nodes = this._typeTreeElement.getTreeNodes();
                    const list = [];
                    this.getTreeNodesAll(nodes, list);
                    this.policyTypeTree.find.list = list.filter(
                        v => v.title.indexOf(searchKey) > -1
                    );
                }
            },
        },

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
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.policyTypeTree.activedNode = data.node;
            console.log(data);
        },
    };

    ngOnInit() {
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
                text: '政策管理',
            },
            {
                type: 'text',
                text: '政策分类设置',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 添加类型
     */
    addPolicyType() {
        this.policyTypeify.form.reset();
        const control: AbstractControl = this.policyTypeify.form.get('isTop');
        // 是否选中已有类型节点
        if (this.policyTypeTree.activedNode.key) {
            this.policyTypeify.form.patchValue({
                topNodeName: this.policyTypeTree.activedNode.title,
                topNodeId: this.policyTypeTree.activedNode.key,
            });
            control.enable();
        } else {
            // 无选中节点，默认添加顶层节点
            this.policyTypeify.form.patchValue({ isTop: true });
            control.disable();
        }
        this.policyTypeify.open();
    }

    /**
     * 取政策类型
     */
    loadTypeTreeData() {
        this.service.getPolicyTypeAll().subscribe(result => {
            if (result) {
                this.policyTypeTree.nodes = result;
            }
        });
    }

    getTreeNodesAll(nodes: NzTreeNode[], list) {
        nodes.forEach(node => {
            list.push(node);
            if (node.children.length > 0) {
                this.getTreeNodesAll(node.children, list);
            }
        });
    }

    getNodeParentsAll(nodes: NzTreeNode[], node: NzTreeNode, list) {
        nodes.forEach(_node => {
            if (node.parentNode && _node.key === node.parentNode.key) {
                list.push(_node);
                this.getNodeParentsAll(nodes, _node, list);
            }
        });
    }

    /**
     * 编辑类型
     */
    editPolicyType() {
        this.policyTypeify.isEdit = true;
        this.policyTypeify.form.patchValue({ groupName: this.policyTypeTree.activedNode.title });
        this.policyTypeify.open();
    }

    /**
     * 类型删除
     */
    deletePolicyType() {
        if (!this.policyTypeTree.activedNode.title) {
            this.message.warning('未选中类型。');
            return;
        }
        this.modalService.confirm({
            nzTitle: `系统提示`,
            nzContent: `<b style="color: red;">确定要删除：${this.policyTypeTree.activedNode.title} 分类？</b>`,
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.service
                    .deletePolicyTypeData(this.policyTypeTree.activedNode.key)
                    .subscribe(isSucceed => {
                        if (isSucceed) {
                            this.policyTypeTree.activedNode.remove();
                            // 当前选中节点是否有父节点
                            if (!this.policyTypeTree.activedNode.parentNode) {
                                // 没有父节点直接删除
                                this.policyTypeTree.nodes.splice(
                                    this.policyTypeTree.nodes.findIndex(
                                        item => item.key === this.policyTypeTree.activedNode.key
                                    ),
                                    1
                                );
                                this.policyTypeTree.nodes = [...this.policyTypeTree.nodes];
                            } else {
                                // 有父节点
                                if (
                                    this.policyTypeTree.activedNode.parentNode.children.length === 0
                                ) {
                                    this.policyTypeTree.activedNode.parentNode.isLeaf = true;
                                }
                            }
                            this.policyTypeTree.activedNode = <any>{};
                        }
                    });
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('Cancel'),
        });
    }
}
