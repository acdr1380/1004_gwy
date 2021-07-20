import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryGzda07JbtService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 工资业务取表格数据
     */
    getWfListData(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/wf/data/getWfListData';
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
}
