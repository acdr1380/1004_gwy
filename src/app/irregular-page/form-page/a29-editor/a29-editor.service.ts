import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Injectable({
    providedIn: 'root',
})
export class A29EditorService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    /**
     * 加载进入信息
     * @param id 编码
     */
    loadA29Data(id) {
        const data = {};

        const key = `${this.tableHelper.getTableCode('A29')}_A01_ID`;
        data[key] = id;
        const url = 'api/gl-service-data-civil/v1/data/person/a29/selectListKeyId';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => (json.data && json.data.length > 0 ? json.data[0] : []))
        );
    }

    /**
     * 保存进入信息
     */
    saveA29Data(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a29/save';
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
}
