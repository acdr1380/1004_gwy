import { ReportReverseQueryService } from './report-reverse-query.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Base64 } from 'js-base64';
import { Title } from '@angular/platform-browser';
import { ReportReverseQueryPrarms } from './enums/ReportReverseQueryPrarms';
import { NzTreeNodeOptions, NzTreeNode, NzFormatEmitEvent } from 'ng-zorro-antd/tree';

@Component({
    selector: 'app-report-reverse-query',
    templateUrl: './report-reverse-query.component.html',
    styleUrls: ['./report-reverse-query.component.scss'],
})
export class ReportReverseQueryComponent implements OnInit {
    /**
     * 套表信息
     */
    URLParams: ReportReverseQueryPrarms;

    /**
     * 反查树
     */
    reverseTreeIfy = {
        nodes: [] as NzTreeNodeOptions[],
        activedNode: <NzTreeNode>{},
        icons: ['sitemap', 'server', 'building-o'],
        expandChange: (event: Required<NzFormatEmitEvent>) => {
            if (event.eventName === 'expand') {
                const node = event.node;
                if (node && node.getChildren().length === 0 && node.isExpanded) {
                    this.URLParams.data.parentKeyId = node.key;
                    this.service
                        .selectReverseReportTree(this.URLParams)
                        .subscribe(result => node.addChildren(result));
                }
            }
        },
        evtActiveNode: (data: NzFormatEmitEvent) => {
            this.reverseTreeIfy.activedNode = data.node;
            this.URLParams.keyId = data.node.key;
            this.reverseQueryTblIfy.loadPage(true);
        },
    };

    reverseQueryTblIfy = {
        data: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
        loadPage: (reset?) => {
            if (reset) {
                this.reverseQueryTblIfy.pageIndex = 1;
            }

            this.URLParams.data.pageIndex = this.reverseQueryTblIfy.pageIndex;
            this.URLParams.data.pageSize = this.reverseQueryTblIfy.pageSize;
            this.service.customReverseReportData(this.URLParams).subscribe(result => {
                result.totalCount = result.totalCount || this.reverseQueryTblIfy.totalCount;
                this.reverseQueryTblIfy = Object.assign(this.reverseQueryTblIfy, result);
            });
        },
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private title: Title,
        private service: ReportReverseQueryService
    ) {}

    ngOnInit() {
        this.initRouterParams();
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
                this.title.setTitle(this.getTitle());
                this.loadReverseReportTree();
                this.reverseQueryTblIfy.loadPage(true);
            }
        });
    }

    /**
     * 获得报表名称
     */
    getTitle() {
        return `${unescape(this.URLParams.childName)}   报表反查坐标(${
            this.URLParams.data.row || 0
        }, ${this.URLParams.data.col || 0})： ${unescape(this.URLParams.title) || ''}`;
    }

    /**
     * 加载反查树
     */
    loadReverseReportTree() {
        this.service.selectReverseReportTree(this.URLParams).subscribe(result => {
            this.reverseTreeIfy.nodes = result;
        });
    }
}
