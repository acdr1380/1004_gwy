import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryTwoYearRiseService {
    constructor(private http: HttpClient, private message: NzMessageService) { }

    /**
     * 业务编码
     */
    public wfId = 'salary_two_year_rise';

    /**
     * 业务名称
     */
    public wfName = '机关工勤两年晋档';

    /**
     * 获得统计数据
     * @param jobId 业务编码
     * @param jobStepId 步骤编码
     */
    getStatisticsData(jobId, jobStepId, unitId) {
        const url = `api/gl-1002-workflow-salary/v1/workflow/salary/two/year/rise/job/selectCountData/${jobId}/${jobStepId}/${unitId}`;
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
            'api/gl-1002-workflow-salary/v1/workflow/salary/two/year/rise/job/selectTabAndTableData';
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
