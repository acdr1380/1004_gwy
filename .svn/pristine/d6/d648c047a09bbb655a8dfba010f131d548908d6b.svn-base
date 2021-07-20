import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { map, filter, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class TibetExamRecordService {
    /**
     * 业务编码
     */
    public wfId = 'tibet_exam_record';

    /**
     * 业务名称
     */
    public wfName = '考录备案业务';
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获取人员列表
     */
    getPersonData(data) {
        return new Promise((resolve, reject) => {
            const url = `api/gl-1004-workflow-tibet/v1/workflow/job/wf/data/getWfData`;
            this.http
                .post<R>(url, data)
                .pipe(
                    tap(json => {
                        if (json.code !== 0) {
                            this.message.error(json.msg);
                        }
                    }),
                    map(json => json.data)
                )
                .subscribe(result => resolve(result));
        });
    }
    /**
     * 获取招录计划
     */
    getExamPlan(data) {
        const url = `api/gl-service-data-civil/v1/data/other/plan/selectListExistBP02`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data.map(v => {
                    return {
                        ...v,
                        planId: v.DATA_3001_OTHER_PLAN_ID,
                        planName: v.PLAN01,
                        text: v.PLAN01,
                        value: v.DATA_3001_OTHER_PLAN_ID,
                    };
                });
            })
        );
    }
}
