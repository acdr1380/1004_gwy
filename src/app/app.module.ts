import { LoadingService } from './components/loading/loading.service';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from './util/common.service';
import { NzMessageModule } from 'ng-zorro-antd/message';

// 引入全部的图标，不推荐 ❌
import * as AllIcons from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { httpInterceptorProviders } from './util/http-interceptors';
import { WfTableHelper } from './util/classes/wf-table-helper';
import { AppConfig } from './app.config';

const antDesignIcons = AllIcons as {
    [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

registerLocaleData(zh);

declare global {
    interface Window {
        /**
         * 个人工资信息详细窗口
         */
        winOperSalaryInfoDlg: any;
        /**
         * 干审表新窗口 使用组件：PersonCorrelComponent
         */
        winAppointFormDlg: any;
        /**
         * 软件使用界面 使用组件：PortalComponent
         */
        winAppManagerDlg: any;

        /**
         * socket申明 使用组件：CameraCZURComponent
         */
        MozWebSocket: any;
        /**
         * 报表窗口
         */
        winReportDlg: any;
    }
}

export function initializeApp(appConfig: AppConfig) {
    return () => appConfig.init();
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NzMessageModule,
        NzNotificationModule,
        NzIconModule.forRoot(icons),
    ],
    providers: [
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppConfig], multi: true },
        httpInterceptorProviders,
        { provide: NZ_I18N, useValue: zh_CN },
        CommonService,
        LoadingService,
        WfTableHelper,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
