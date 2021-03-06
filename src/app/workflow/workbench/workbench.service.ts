import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { filter, map, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AppConfig } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class WorkbenchService {
    protected appSettings = AppConfig.settings;
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 加载办理业务列表
     * @param data 参数
     */
    getWfList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/workbench/info/getWfList';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得业务主表信息
     * @param wfId 业务编码
     */
    getWfMainData(wfId: string) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/main/detail';
        return this.http.get<R>(`${url}/${wfId}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取代管的单位
     */
    getAgentOrgList(id) {
        const url = 'api/gl-service-sys-user/v1/user/system/agent/unit/selectAgentUnit';
        return this.http.post<R>(url, { USER_ID: id }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 终止业务
     * @param data 参数
     */
    stopOper(data) {
        const array = data.wfId.split('_');
        const url = `api/gl-workflow-${array.join('-')}/v1/workflow/${data.wfId
            .split('_')
            .join('/')}/job/stop`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('业务终止成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务列表
     */
    selectByWfId(wfId) {
        const url = `api/gl-1002-workflow-core/v1/workflow/workbench/info/selectByWfId/${wfId}`;
        return this.http.get<R>(url).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得业务权限
     */
    getAuthWfId() {
        return new Promise((resolve, reject) => {
            const authwf = sessionStorage.getItem(environment.config.PROJECT_PATH_ROOT + '_wf');
            if (authwf) {
                resolve(JSON.parse(authwf));
            } else {
                const url =
                    'api/gl-service-sys-user/v1/user/system/user/auth/flow/selectListByAuthFlow';
                this.http
                    .post<R>(url, null)
                    .pipe(
                        tap(json => {
                            if (json.code !== 0) {
                                this.message.error('加载业务权限异常。');
                            } else {
                                sessionStorage.setItem(
                                    environment.config.PROJECT_PATH_ROOT + '_wf',
                                    JSON.stringify(json.data)
                                );
                            }
                        }),
                        map(json => json.data)
                    )
                    .subscribe(result => resolve(result));
            }
        });
    }
}
