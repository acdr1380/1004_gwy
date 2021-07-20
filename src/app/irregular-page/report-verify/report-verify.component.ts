/*
 * @Author: mikey.胡文鸿
 * @Date: 2020-06-10 11:49:27
 * @Last Modified by: mikey.胡文鸿
 * @Last Modified time: 2020-06-10 11:50:36
 */
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ReportCommonParams } from '../report-common/enums/ReportCommonParams';
import { Base64 } from 'js-base64';
import { ReportVerifyService } from './report-verify.service';

declare global {
    interface Window {
        reportCommon_SelectChildTable: any;
    }
}

@Component({
    selector: 'app-report-verify',
    templateUrl: './report-verify.component.html',
    styleUrls: ['./report-verify.component.scss'],
})
export class ReportVerifyComponent implements OnInit {
    /**
     * 套表信息
     */
    URLParams: ReportCommonParams;

    /**
     * 子表校验结果
     */
    errorSubListIfy = {
        find: {
            list: [],
            parentList: [],
            keyword: null,
            evtOpenChange: status => {
                if (status) {
                }
            },
            evtOnSearch: (keyword: string) => {
                if (keyword) {
                }
            },
            evtChange: value => {},
        },
        list: [],
        selectedChild: null,
        evtSelected: item => {
            this.errorSubListIfy.selectedChild = item;
            if (window.reportCommon_SelectChildTable) {
                window.reportCommon_SelectChildTable(item.childId);
            }
        },
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private title: Title,
        private service: ReportVerifyService
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
                this.loadReportCheckData();
            }
        });
    }

    /**
     * 获得报表名称
     */
    getTitle() {
        return `报表校验：${unescape(this.URLParams.title) || ''}`;
    }

    /**
     * 加载报表校验
     */
    loadReportCheckData() {
        this.service.getReportCheckData(this.URLParams.keyId).subscribe(result => {
            this.errorSubListIfy.list = result;
            if (result.length > 0) {
                const [first] = result;
                this.errorSubListIfy.selectedChild = first;
                this.errorSubListIfy.evtSelected(first);
            }
        });
    }
}
