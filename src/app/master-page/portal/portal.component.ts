import { PortalService } from './portal.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonService } from 'app/util/common.service';
import { environment } from 'environments/environment';
import { AppConfig } from 'app/app.config';

@Component({
    selector: 'gl-portal',
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss'],
})
export class PortalComponent implements OnInit {
    protected appSettings = AppConfig.settings;
    // 项目名称
    projectName = '';
    // 用户信息
    userInfo;

    /**
     * 基础管理
     */
    baseManagerIfy = {
        list: [],
        loadData: () => {
            this.service.getBaseManageData().subscribe(result => {
                this.baseManagerIfy.list = result;
            });
        },
        into: item => {
            this.router.navigate(['/client']);
            // const url = `client`;

            // window.winAppManagerDlg = window.open(url, 'report-common');
            // if (window.winAppManagerDlg && window.winAppManagerDlg.closed) {
            //     window.winAppManagerDlg.focus();
            // }
        },
    };

    /**
     * 业务模块
     */
    operModuleIfy = {
        list: [],
        loadData: () => {
            this.service.getOperModuleData().subscribe(result => {
                this.operModuleIfy.list = result;
            });
        },
        getIconURL: item => {
            return `assets/images/portal/${item.label}.png`;
        },
    };

    /**
     * 政策法规
     */
    policyLawsIfy = {
        list: [],
        loadData: () => {
            this.service.getPolicyLawsData().subscribe(result => {
                this.policyLawsIfy.list = result;
            });
        },
    };

    constructor(
        private commonService: CommonService,
        private service: PortalService,
        private title: Title,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.projectName = this.appSettings.appInsights.PROJECT_NAME;
        this.title.setTitle(this.projectName);

        this.userInfo = this.commonService.getUserLoginInfo();

        this.baseManagerIfy.loadData();
        this.operModuleIfy.loadData();
        this.policyLawsIfy.loadData();
    }

    /**
     * 退出账号
     */
    evtLogout() {
        this.service.userLogout().subscribe(result => {
            this.router.navigate(['login']);
        });
    }
}
