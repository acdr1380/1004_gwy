import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppConfig } from 'app/app.config';
import { environment } from 'environments/environment';
import { Base64 } from 'js-base64';

@Component({
    selector: 'app-oper-salary-info-page',
    templateUrl: './oper-salary-info-page.component.html',
    styleUrls: ['./oper-salary-info-page.component.scss'],
})
export class OperSalaryInfoPageComponent implements OnInit {
    protected appSettings = AppConfig.settings;
    URLParams;
    constructor(private title: Title, private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.title.setTitle(this.appSettings.appInsights.PROJECT_NAME);
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
                this.URLParams.name = unescape(this.URLParams.name);
            }
        });
    }
}
