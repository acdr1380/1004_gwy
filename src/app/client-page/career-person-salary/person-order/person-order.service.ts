import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PersonOrderService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得人员列表
     * @param data 参数
     */
    getPersonList(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectListByOrgId';
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
     * 上下移
     * @param data 参数
     */
    adjustSort(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/adjustSort';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('移动成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 移动到
     * @param data 参数
     */
    adjustSortTo(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/adjustSortTo';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('移动成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
