import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilAllowanceChangeService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_allowance_change';

    /**
     * 业务名称
     */
    public wfName = '津补贴业务（公务员）';

    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获取津补贴业务信息
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
