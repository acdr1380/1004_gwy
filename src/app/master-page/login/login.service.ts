import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { AppConfig } from 'app/app.config';
import { environment } from 'environments/environment';

// import CryptoJS from 'crypto-js';
declare const CryptoJS: any;

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    protected appSettings = AppConfig.settings;

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 登录验证
     *
     * @param {*} data 验证内容
     * @returns {Observable<boolean>} 是否成功
     */
    attemptAuth(data): Observable<R> {
        const url = 'api/gl-service-sys-user/v1/user/system/auth/login';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            ProjectNo: this.appSettings.aad.PROJECT_NO,
        });

        const credentials = this.encryptedDESLogin(data);
        return this.http.post<R>(url, { data: credentials }, { headers }).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.commonService.setUserLoginInfo(json.data);
                    this.loadAuthData(json.data.id);
                    this.message.success('登录成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }

    /**
     * 加载人员权限
     * @param SYSTEM_USER_ID 人员编码
     */
    private loadAuthData(SYSTEM_USER_ID) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/loadAuthData';
        this.http
            .post<R>(url, { SYSTEM_USER_ID })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg || '未知错误');
                    }
                })
            )
            .subscribe();
    }

    /**
     * 加密帐号信息
     *
     * @private
     * @param {*} data 加密内容
     * @returns
     */
    private encryptedDESLogin(data): void {
        data = `${data.userAccount}:${data.password}`;
        const keyHex = CryptoJS.enc.Utf8.parse(environment.config.NB_NETWORK_CONFIG_DESKey);
        // 模式为ECB padding为Pkcs7
        const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        // 加密出来是一个16进制的字符串
        return encrypted.ciphertext.toString();
    }
}
