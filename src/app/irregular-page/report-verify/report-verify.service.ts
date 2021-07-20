import { filter, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';

@Injectable({
    providedIn: 'root',
})
export class ReportVerifyService {
    constructor(private http: HttpClient) {}

    /**
     * 获得校验结果
     * @param keyId 报表编码
     */
    getReportCheckData(keyId: string) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/loadReportCheckData';
        return this.http.get<R>(`${url}/${keyId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
