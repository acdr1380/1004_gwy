import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, filter, map } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root'
})
export class StandingPersonTableService {

    constructor(private http: HttpClient, private message: NzMessageService) { }

    getPostPerosnList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/wf/data/getWfListData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取
     */
    getConditionData(data: any) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/wf/data/getWfData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

}
