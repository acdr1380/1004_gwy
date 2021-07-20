import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class AgentManageService {
    constructor(private http: HttpClient, private message: NzMessageService) { }
    /**
     * 获取代管单位列表数据
     */
    getAgentUnit(data): Observable<any> {
        const url = `api/gl-service-data-civil/v1/data/unit/b01c/selectPageByAgentUnit`;
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
     * 获取具体单位的数据
     */
    getUnitKeyId(KeyId): Observable<any> {
        const url = `api/gl-service-data-civil/v1/data/unit/b01c/selectListKeyId`;
        return this.http
            .post<R>(url, {
                DATA_1002_UNIT_B01C_B01_ID: KeyId,
            })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(v => {
                        return {
                            ...v,
                            unit_CN: v.B0101,
                        };
                    })
                )
            );
    }
    /**
     * 保存经办人数据
     */
    saveData(data) {
        const url = `api/gl-service-data-civil/v1/data/unit/b01c/insert`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('保存成功!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    /**
     * 删除数据信息
     */
    delete(data) {
        const url = `api/gl-service-data-civil/v1/data/unit/b01c/delete`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('删除成功!');
                }
            }),
            filter(json => json.code === 0),
            map(() => true)
        );
    }
    /**
     * 编辑数据信息
     */
    edit(data) {
        const url = `api/gl-service-data-civil/v1/data/unit/b01c/update`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('修改成功!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
