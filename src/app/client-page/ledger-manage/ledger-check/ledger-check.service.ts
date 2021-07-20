import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, filter, map } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class LedgerCheckService {
    constructor(private http: HttpClient, private message: NzMessageService) { }

    /**
     * 获得账本校验数据
     */
    getCheckListData(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/checkExecute';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
