import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryLevelRiseService {
    /**
     * 业务编码
     */
    public wfId = 'salary_level_rise';

    /**
     * 业务名称
     */
    public wfName = '薪级晋升业务';

    constructor(private http: HttpClient, private message: NzMessageService) { }


    /**
     * 获取业务标签表格信息
     * @param data 参数
     */
    selectTabAndTableData(data) {
        const url =
            'api/gl-1002-workflow-salary/v1/workflow/salary/level/rise/job/selectTabAndTableData';
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
