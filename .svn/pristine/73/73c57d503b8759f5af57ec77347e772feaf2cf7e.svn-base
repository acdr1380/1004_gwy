import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, filter, map } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class WorkChangeService {
    constructor(private http: HttpClient, private message: NzMessageService) {}
    /**
     * 计算工龄
     */
    computeYear(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/inner/transfer/job/computeYear`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('计算成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
