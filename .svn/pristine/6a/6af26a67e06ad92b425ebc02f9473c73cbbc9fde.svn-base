import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class AllowanceTableService {
    constructor(private http: HttpClient, private message: NzMessageService) { }
    /**
     * 获取津补贴数据
     */
    getSpecailWfData(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/allowance/change/job/getSpecailWfData',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg || '数据获取失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
}
