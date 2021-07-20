import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ListsQueryService } from './lists-query.service';
import { FormTypeEnum } from './enums/FormTypeEnum';
import { CommonService } from 'app/util/common.service';
import { ClientService } from 'app/master-page/client/client.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SelectUnitLevelDrawerComponent } from 'app/components/select-unit-level/select-unit-level-drawer/select-unit-level-drawer.component';

@Component({
    selector: 'app-lists-query',
    templateUrl: './lists-query.component.html',
    styleUrls: ['./lists-query.component.scss'],
})
export class ListsQueryComponent implements OnInit, OnDestroy {
    /**
     * 表册类型标签
     */
    formTypeTabsetIfy = {
        selectedIndex: 0,
        formList: [],
        evtChange: ({ index }) => {
            this.unitFormMagerIfy.permission = null;
            switch (index) {
                case 0:
                    this.formTypeTabsetIfy.formList = this.rosterIfy.list;
                    break;
                case 1:
                    this.formTypeTabsetIfy.formList = this.statisticalIfy.list;
                    break;
            }
        },
    };

    /**
     * 花名册
     */
    rosterIfy = {
        list: [],
        selectIndex: -1,
    };

    /**
     * 统计表
     */
    statisticalIfy = {
        list: [],
    };

    /**
     * 当前显示表册相关
     */
    unitFormMagerIfy = {
        params: null,
        permission: null,
        /**
         * 当前显示表册
         */
        selectForm: null,
    };

    @ViewChild('selectUnitDrawer', { static: false })
    selectUnitDrawer: SelectUnitLevelDrawerComponent;
    /**
     * 选择单位
     */
    unitSelectedIfy = {
        list: [],
    };

    constructor(
        private service: ListsQueryService,
        private commonService: CommonService,
        private clientService: ClientService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.loadFormsList();
        // 面包屑
        this.clientService.buildBreadCrumb([
            {
                icon: 'home',
                link: '/client/index',
                type: 'home',
            },
            {
                type: 'text',
                text: '表册查询',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    // 表册列表取数
    loadFormsList() {
        this.service.getGroupFormList('gzgnbcbccx').subscribe(result => {
            this.rosterIfy.list = result.filter(v => v.FORM_TYPE === FormTypeEnum.ROSTER);
            this.formTypeTabsetIfy.formList = this.rosterIfy.list;
            this.statisticalIfy.list = result.filter(v => v.FORM_TYPE === FormTypeEnum.STATISTICS);
        });
    }

    /**
     * 加载表册
     * @param item 表册参数
     */
    evtLoadFormPage(item) {
        if (!item) {
            return;
        }
        this.unitFormMagerIfy.selectForm = item;
        this.unitFormMagerIfy.permission = item.FORM_PERMISSION;
        if (this.unitSelectedIfy.list.length === 0) {
            return;
        }
        const params: any = {};
        // 构造表册参数
        params.QUERY_ORG_LIST = this.unitSelectedIfy.list.map(v => ({
            DATA_UNIT_ORG_ID: v.orgId,
            $TREE_INCLUDE_LOWER_LEVEL$: v.includeChild,
        }));
        this.unitFormMagerIfy.params = params;
    }

    /**
     * 清空发送单位
     */
    clearAllUnits() {
        this.unitSelectedIfy.list = [];
    }

    /**
     * 关闭单位标签
     */
    delSendObject(index) {
        const node = this.unitSelectedIfy.list.splice(index, 1);
        this.evtLoadFormPage(this.unitFormMagerIfy.selectForm);
    }

    /**
     * 选择单位
     */
    evtLoadSelectUnit() {
        this.selectUnitDrawer.open();
    }

    /**
     * 选中单位后
     */
    evtSelectedUnit(event) {
        const data = event.map(v => ({
            orgName: v.title,
            orgId: v.key,
            includeChild: !!v.origin.includeChild,
        }));
        this.commonService.getCheckedTreeNodeCount([...data]).subscribe(result => {
            if (result) {
                this.unitSelectedIfy.list = result;
                // 加载表册设置标识符
                this.evtLoadFormPage(this.unitFormMagerIfy.selectForm);
                this.selectUnitDrawer.close();
            }
        });
    }
}
