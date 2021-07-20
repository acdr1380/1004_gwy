import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ClientService } from 'app/master-page/client/client.service';
import { NzTreeNodeOptions, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { PolicyInfo } from '../../db/entity/PolicyInfo';
import { ResultService } from './result.service';
import { Base64 } from 'js-base64';

@Component({
    selector: 'app-result',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: ResultService
    ) {}

    /**
     * 关键字
     */
    queryString = '';
    /**
     * 搜索内容类型
     */
    searchType = [];
    /**
     * 路由参数
     */
    URLParams = <any>{};

    /**
     * 政策表格内容
     */
    policyTable = {
        content: [],
        page: 1,
        size: 5,
        totalElements: 0,
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
        // 是否选中政策类型
        isType: false,
        // 选中分类
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.policyTypeTree.activedNode = data.node;
            this.policyTypeTree.isType = true;
            this.loadSearchPolicyData(true);
        },
    };

    ngOnInit() {
        this.loadTypeTreeData();
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
                text: '查询内容',
            },
        ]);

        this.initRouterParams();
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 取政策类型
     */
    loadTypeTreeData() {
        this.service.getPolicyTypeAllCount().subscribe(result => {
            if (result) {
                this.policyTypeTree.nodes = result;
            }
        });
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                // 保存路由参数
                this.queryString = this.URLParams.queryString;
                this.searchType = this.URLParams.searchType;
                this.policyTypeTree.isType = false;
                this.loadSearchPolicyData();
            }
        });
    }

    /**
     * 加载政策表格数据
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
     * 查看政策具体信息，跳转文档界面
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
