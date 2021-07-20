import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { R } from 'app/entity/vo/R';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ExcelControlService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    //#region 表册相关

    /**
     * 加载表册信息
     * @param id 参数
     */
    getFormData(permission, version) {
        const url = 'api/gl-service-sys-core/v1/core/system/form/selectOneByPermission';
        return this.http.post<R>(url, { FORM_PERMISSION: permission, FORM_VERSION: version }).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得表册sheet
     */
    getExcelSheetList(id) {
        const url = 'api/gl-service-data/v1/data/form/getExcelSheetName';
        return this.http
            .post<R>(url, {
                SYS_FORM_ID: id,
            })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning('表册数据sheet获取失败。');
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => ({
                        name: item,
                    }))
                )
            );
    }

    /**
     * 获得excel对应HTML内容
     * @param url 路径
     */
    getExcelOfHTML(path: string): Promise<string> {
        return this.http.get(path, { responseType: 'text' }).toPromise();
    }

    /**
     * 加载表册数据
     * @param data 参数
     */
    getFormExecute(data, getDataURL?) {
        const url = getDataURL || 'api/gl-service-data/v1/data/form/execute';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning('表册数据未能加载。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得区域设置
     * @param data 参数
     */
    getAreaSettingList(data) {
        const url = 'api/gl-service-sys-core/v1/core/system/form/area/selectListByFormId';
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
     * 加载表册配置信息
     * @param data 参数
     */
    getFormPageConfig(data) {
        const url = 'api/gl-service-data/v1/data/form/getFormConfig';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning('表册配置未能加载。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 下载表册
     * @param data 参数
     */
    downExcel(data) {
        const url = 'api/gl-service-data/v1/data/form/downloadExcel';
        return this.commonService.downFilePost(url, data);
    }

    //#endregion
}
