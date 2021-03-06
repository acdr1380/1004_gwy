import { Component, OnInit, OnDestroy } from '@angular/core';
import { Base64 } from 'js-base64';
import { JournalQueryService } from '../journal-query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
@Component({
    selector: 'app-oper-list',
    templateUrl: './oper-list.component.html',
    styleUrls: ['./oper-list.component.scss'],
})
export class OperListComponent implements OnInit, OnDestroy {
    pageParams = {
        NAME: '',
        ID: '',
        YEAR: -1,
        MONTH: -1,
        TYPE: 'oper',
        OrgList: [],
        TABLEID: '',
        redirect: '',
    };
    tabOp = {
        title: '',
    };
    /**
     * 搜索
     */
    select = <any>{
        data: [],
        selectedValue: null,
    };
    // 业务表格
    operTable = {
        content: <any>[],
        pageSize: 5,
        pageIndex: 1,
        totalElements: 0,
        isLoading: true,
        selectedIndex: -1,
        loadData: () => {
            this.operTable.isLoading = false;
            this.tabOp.title = `${this.pageParams.NAME}(4)`;
            this.service
                .getCurrentOperList({
                    wfId: this.pageParams.ID,
                    selectOrgParamList: this.pageParams.OrgList,
                    year: this.pageParams.YEAR,
                    month: this.pageParams.MONTH,
                })
                .subscribe(result => {
                    this.operTable.content = result.map(v => {
                        return {
                            ...v,
                            value: v.jobId,
                            text: v.userName,
                        };
                    });
                    this.operTable.isLoading = false;
                    this.tabOp.title = `${this.pageParams.NAME}(${result.length})`;
                });
        },
    };

    constructor(
        private service: JournalQueryService,
        private route: ActivatedRoute,
        private router: Router,
        private clientService: ClientService
    ) {}

    ngOnInit() {
        // 获取页面参数
        const pageParams = this.pageParams;
        this.route.queryParams.subscribe(params => {
            Object.assign(pageParams, JSON.parse(Base64.decode(params['details'])));
        });
        const month = pageParams.MONTH !== -1 ? `${pageParams.MONTH}月` : '';
        // 设置面包屑
        /**
         * 创建面包屑导航
         */
        this.clientService.buildBreadCrumb([
            {
                type: 'event',
                icon: 'left',
                event: () => {
                    this.router.navigateByUrl(this.pageParams.redirect);
                },
            },
            {
                type: 'event',
                text: '业务台账',
                event: () => {
                    this.router.navigateByUrl(this.pageParams.redirect);
                },
            },
            { type: 'text', text: `${month}` },
        ]);
        // 加载表格数据
        this.operTable.loadData();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }
    /**
     * 搜索关键字
     */
    searchKey(event) {
        const data = this.operTable.content.filter(v => {
            const index = v.userName.indexOf(event);
            if (index !== -1) {
                return v;
            }
        });
        this.select.data = data;
    }
    /**
     * 选中
     */
    moduleChange(item) {
        // this.select.selectedValue = item;
        // this.operTable.selectedIndex;
        const index = this.operTable.content.findIndex(v => v.value === item);

        this.operTable.pageIndex =
            // tslint:disable-next-line:radix
            parseInt((index / this.operTable.pageSize).toString()) + 1;
        this.operTable.selectedIndex = index % this.operTable.pageSize;
    }
    goWfView(data) {
        const GL = Base64.encode(
            JSON.stringify({
                jobId: data.jobId,
                jobStepId: data.jobStepId,
                stepId: data.stepId,
                jobStepState: data.jobStepState,
                parentStepId: data.parentStepId,
                isReadOnly: true,
                lastStepId: data.lastStepId,
                view: 'oper',
                redirect: this.router.url,
            })
        );
        const url = `client/workflow/factory/${data.wfId}/${data.stepId}`;
        // this.router.navigate([url, { GL }], { skipLocationChange: false });
        this.router.navigate([url], { queryParams: { GL } });
    }
}
