import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Base64 } from 'js-base64';
import { PolicyQueryService } from './policy-query.service';
import { KeywordInfo } from '../db/entity/KeywordInfo';

@Component({
    selector: 'app-policy-query',
    templateUrl: './policy-query.component.html',
    styleUrls: ['./policy-query.component.scss'],
})
export class PolicyQueryComponent implements OnInit {
    /**
     * 搜索框内容，观察对象
     */
    queryString: string;
    queryString$ = new Subject<string>();
    /**
     * 搜索内容类型
     */
    checkOptionsOne = [
        { label: '标题', value: 'title', checked: true },
        { label: '文号', value: 'documentNumber', checked: true },
        { label: '内容', value: 'contentText', checked: true },
    ];
    /**
     * 默认显示类型
     */
    checkOptionsModel = ['title', 'documentNumber', 'contentText'];
    /**
     * 热搜列表
     */
    keywordList: Array<KeywordInfo> = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: PolicyQueryService
    ) {}

    ngOnInit() {
        // 订阅查找内容
        this.queryString$
            .pipe(
                debounceTime(300),
                // distinctUntilChanged(),
                map(query_str => query_str.trim())
            )
            .subscribe(query_str => {
                // 路由参数
                const GL = Base64.encode(
                    JSON.stringify({
                        queryString: query_str,
                        searchType: this.checkOptionsOne,
                        rd: +new Date(),
                    })
                );
                // 跳转result界面
                this.router
                    .navigate(['result', { GL: GL }], { relativeTo: this.activatedRoute })
                    .then(_ => {
                        this.loadKeywordList();
                    });
                // this.loadKeywordList();
            });
        this.loadKeywordList();
        this.initRouterParams();
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        if (this.activatedRoute.children.length === 0) {
            return;
        }
        this.activatedRoute.children[0].paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                const URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.queryString = URLParams.queryString;
                this.checkOptionsOne = URLParams.searchType;
            }
        });
    }

    /**
     * 内容搜索
     */
    staffSearch() {
        this.checkOptionsOne.map(v => {
            const index = this.checkOptionsModel.findIndex(item => item === v.value);
            if (index !== -1) {
                v.checked = true;
            } else {
                v.checked = false;
            }
        });
        this.queryString$.next(this.queryString);
    }

    /**
     * 回车事件
     * @param {*} {keyCode} 按键对象
     */
    eventKeyDown({ keyCode }) {
        if (keyCode === 13) {
            this.staffSearch();
        }
    }

    /**
     * 热搜关键字点击事件
     */
    eventQueryHistory({ keyword }) {
        this.queryString = keyword;
        this.staffSearch();
    }

    /**
     * 取热搜关键字
     */
    loadKeywordList() {
        this.service.getKeywordList().subscribe(result => (this.keywordList = result));
    }
}
