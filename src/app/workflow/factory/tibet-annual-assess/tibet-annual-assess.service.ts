import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TibetAnnualAssessService {

    constructor(private http: HttpClient, private message: NzMessageService) { }
    /**
     * 业务编码
     */
    public wfId = 'tibet_annual_assess';

    /**
     * 业务名称
     */
    public wfName = '年度考核业务';

    /**
     * 获得统计数据
     * @param jobId 业务编码
     * @param jobStepId 步骤编码
     */
    getStatisticsData(jobId, jobStepId) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/annual/assess/job/selectCountData/${jobId}/${jobStepId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务标签表格信息
     * @param data 参数
     */
    selectTabAndTableData(data) {
        const url =
            'api/gl-1004-workflow-tibet/v1/workflow/tibet/annual/assess/job/selectTabAndTableData';
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
