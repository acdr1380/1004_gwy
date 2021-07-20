import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PersonVerifyService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 数据校验
     * @param data 参数
     */
    checkExecute(data) {
        const url = 'api/gl-service-data-civil/v1/data/check/checkExecute';
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
