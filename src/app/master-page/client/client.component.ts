import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, RouterEvent, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonService } from 'app/util/common.service';
import { environment } from 'environments/environment';
import { BreadcrumbItem, ClientService } from './client.service';

import * as _ from 'lodash';
import { AppConfig } from 'app/app.config';

@Component({
    selector: 'gl-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit {
    protected appSettings = AppConfig.settings;
    // 项目名称
    projectName = '';
    projectNameSign = '';
    menus = [];

    breadcrumbList: BreadcrumbItem[] = [];
    isCollapsed = false;

    private subscription: Subscription;

    userInfo;

    /**
     * 账号信息
     */
    accountInfoIfy = {
        title: '用户信息',
        width: 420,
        visible: false,
        close: () => {
            this.accountInfoIfy.visible = false;
        },
        open: () => {
            this.accountInfoIfy.visible = true;
        },

        SYS_USER_ATTACH_2: null,
        form: new FormGroup({
            SYSTEM_USER_NAME: new FormControl(null, Validators.required),
            SYS_USER_ATTACH: new FormControl(null, Validators.required),
            SYS_USER_ATTACH_1: new FormControl(null, Validators.required),
            // SYS_USER_ATTACH_2: new FormControl(null, Validators.required),
            SYS_USER_ID_CARD: new FormControl(null, Validators.required),
            SYSTEM_USER_PHONE: new FormControl(null, Validators.required),
        }),
        save: () => {
            if (this.commonService.formVerify(this.accountInfoIfy.form)) {
                const data = this.accountInfoIfy.form.getRawValue();

                const userInfo = this.commonService.getUserLoginInfo();
                const params = {
                    ...data,
                    SYSTEM_USER_ID: userInfo.userId,
                    SYS_USER_ATTACH_2: this.accountInfoIfy.SYS_USER_ATTACH_2,
                };
                this.service.updateSysUserInfo(params).subscribe(() => {
                    this.accountInfoIfy.close();
                });
            }
        },
    };

    currentUrl = '';
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private title: Title,
        private service: ClientService,

        private cdRef: ChangeDetectorRef,
        private commonService: CommonService
    ) {}

    ngOnInit() {
        this.currentUrl = this.router.url;

        this.userInfo = this.commonService.getUserLoginInfo();
        this.projectName = this.appSettings.appInsights.PROJECT_NAME;
        this.projectNameSign = this.appSettings.appInsights.PROJECT_NAME_SIGN;
        this.title.setTitle(this.projectName);
        this.loadSuBreadcrumb();
        this.loadResourceTree();

        this.loadUserInfoReplenish();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /**
     * 订阅面包屑
     */
    loadSuBreadcrumb() {
        this.subscription = this.service.getBreadCrumb().subscribe(data => {
            this.breadcrumbList = data || [];
            this.cdRef.detectChanges();
        });
    }

    /**
     * 面包屑事件
     * @param item 面包屑项
     */
    evtBreadcrumbItem(item: BreadcrumbItem) {
        switch (item.type) {
            case 'home':
                this.router.navigate(['client']).then(route => {
                    this.loadFirstRouter();
                });
                break;
            case 'event':
                item.event();
                break;
        }
    }

    /**
     * 加载系统导航
     */
    loadResourceTree() {
        // this.menus$ = this.service.getMenus();
        this.service.getResourceTreeListAll().then(result => {
            this.menus = result;
            this.loadFirstRouter();
        });
    }

    /**
     * 加载第一个路由地址
     */
    private loadFirstRouter() {
        if (this.activatedRoute.children.length > 0) {
            return;
        }
        const url = this.getNavigateFirst(_.cloneDeep(this.menus));
        this.router.navigate([url]);
    }

    /**
     * 获得第一个路由地址
     * @param menus 导航
     */
    private getNavigateFirst(menus) {
        const [first] = menus;
        if (first && first.link) {
            return first.link;
        } else {
            if (first.children && first.children.length > 0) {
                return this.getNavigateFirst(first.children);
            } else {
                menus.shift();
                return this.getNavigateFirst(menus);
            }
        }
    }

    /**
     * 退出账号
     */
    evtLogout() {
        this.service.userLogout(this.userInfo.userId).subscribe(result => {
            this.router.navigate(['login']);
        });
    }

    /**
     * 用户补充信息
     */
    async loadUserInfoReplenish() {
        const userInfo = this.commonService.getUserLoginInfo();
        const status = await this.service.isNeedAffirmInfo(userInfo.userId).toPromise();
        if (status) {
            // this.accountInfoIfy.open();
        }
    }
}
