import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class HeadFieldsAdjustService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 调整字段
    /**
     * 保存用户调整后的字段
     *
     * @param {*} data 保存内容
     * @memberof PersonmgrService
     */
    saveParameterData(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/save';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('保存成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得用户保存的字段
     *
     * @param {string} id 编码
     * @param {UserParameterTypeEnum} pramType 类型
     * @param {AuthTypeEnum} authType 类型
     * @memberof PersonmgrService
     */
    getParameterData(data: any) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/selectListByUserId';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data || [])
        );
    }

    /**
     * 删除用户保存字段
     * @param data 参数
     */
    deleteParameterdata(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/delete';
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
    //#endregion
}
