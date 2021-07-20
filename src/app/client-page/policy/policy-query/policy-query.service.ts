import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { KeywordInfo } from '../db/entity/KeywordInfo';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class PolicyQueryService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得热搜关键字
     */
    getKeywordList(): Observable<Array<KeywordInfo>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/keyword/info/detail';
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                    return;
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
