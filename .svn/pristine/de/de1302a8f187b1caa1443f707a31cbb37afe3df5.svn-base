import { filter, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
@Injectable({
    providedIn: 'root',
})
export class ReportReverseQueryService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 反查树节点
     */
    selectReverseReportTree(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/selectReverseReportTree';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data.map(item => ({
                    ...item,
                    // title: item.REPORT_NAME,
                    title: `${item.REPORT_NAME}(${item.REPORT_COUNT || 0})`,
                    key: item.REPORT_KEY_ID,
                    isLeaf: !item.REPORT_HAVE_CHILD,
                }));
            })
        );
    }

    /**
     * 反查信息
     * @param data 参数
     */
    customReverseReportData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/customReverseReportData';
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
