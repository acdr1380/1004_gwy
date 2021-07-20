import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AgentManageService } from './agent-manage.service';
import { CommonService } from 'app/util/common.service';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WorkflowService } from 'app/workflow/workflow.service';

@Component({
    selector: 'app-agent-manage',
    templateUrl: './agent-manage.component.html',
    styleUrls: ['./agent-manage.component.scss'],
})
export class AgentManageComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private modalService: NzModalService,
        private messageService: NzMessageService,
        private service: AgentManageService,
        private commonService: CommonService,
        private workflowService: WorkflowService,
    ) { }

    /**
     * 用户信息
     */
    sessionInfo;

    /**
     * 经办人信息卡片
     */
    messageCard = {
        searchModel: null,
        searchIndex: -1,
        ngModelChange: event => {
            this.messageCard.data = this.messageCard.orignResult.filter(
                v => v.B01C01.indexOf(event) > -1
            );
        },
        /**
         * 当前选中联系人
         */
        currentData: <any>{},
        orignResult: [],
        data: [],
        // 添加
        add: () => {
            this.messageDrawer.title = '新增经办人信息';
            this.messageCard.currentData = {};
            this.messageDrawer.form.reset();
            this.messageDrawer.open();
        },
        // 编辑
        edit: item => {
            this.messageDrawer.title = '修改经办人信息';
            this.messageCard.currentData = item;
            this.messageDrawer.form.patchValue(item);
            this.messageDrawer.open();
        },
        delete: (item, index) => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除该条信息吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .delete({ DATA_3001_UNIT_B01C_ID: item.DATA_3001_UNIT_B01C_ID })
                        .subscribe(result => {
                            this.messageCard.data.splice(index, 1);
                            this.messageCard.data = [...this.messageCard.data];
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    /**
     * 填写信息抽屉
     */
    messageDrawer = {
        visible: false,
        width: 450,
        title: '新增经办人信息',
        form: new FormGroup({
            B01C01: new FormControl(null, Validators.required),
            B01C02: new FormControl(null, [
                Validators.required,
                Validators.pattern(this.workflowService.reg.contactNumberReg)]),
            DATA_3001_UNIT_B01C_B01_ID: new FormControl(null, Validators.required),
        }),
        open: () => (this.messageDrawer.visible = true),
        close: () => (this.messageDrawer.visible = false),
        confirm: () => {
            const data = this.messageDrawer.form.value;
            // 表单验证
            if (!this.commonService.formVerify(this.messageDrawer.form)) {
                return;
            }
            // 修改
            if (this.messageCard.currentData['DATA_3001_UNIT_B01C_ID']) {
                data.DATA_3001_UNIT_B01C_ID = this.messageCard.currentData.DATA_3001_UNIT_B01C_ID;
                this.service.edit(data).subscribe(result => {
                    result.B0101 = this.messageCard.currentData.B0101;
                    result.unit_CN = this.messageCard.currentData.B0101;
                    const index = this.messageCard.data.findIndex(
                        v => v.DATA_3001_UNIT_B01C_ID === data.DATA_3001_UNIT_B01C_ID
                    );
                    const index2 = this.messageCard.orignResult.findIndex(
                        v => v.DATA_3001_UNIT_B01C_ID === data.DATA_3001_UNIT_B01C_ID
                    );
                    this.messageCard.orignResult[index2] = result;
                    this.messageCard.data[index] = result;
                    this.messageCard.data = [...this.messageCard.data];
                });
            } else {
                this.service.saveData(data).subscribe(result => {
                    result.B0101 = this.messageCard.currentData.B0101;
                    result.unit_CN = this.messageCard.currentData.B0101;
                    this.messageCard.orignResult.push(result);
                    this.messageCard.data = this.messageCard.orignResult;
                });
            }
            this.messageDrawer.close();
        },
        cancel: () => {
            this.messageCard.currentData.B0101 = this.messageCard.currentData.unit_CN;
            this.messageDrawer.close();
        },
    };

    ngOnInit() {
        this.sessionInfo = this.commonService.getUserLoginInfo();

        // 创建面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '系统设置',
            },
            {
                type: 'text',
                text: '经办人管理',
            },
        ]);
        this.getUnit();
    }
    ngOnDestroy() {
        // 取消订阅面包屑导航
        this.clientService.clearBreadCrumb();
    }

    /**
     * 经办人取数
     */
    getUnit() {
        this.service.getUnitKeyId(this.sessionInfo.unitId).subscribe(result => {
            this.messageCard.orignResult = result;
            this.messageCard.data = result;
        });
    }
}
