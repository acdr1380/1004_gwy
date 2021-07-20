import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export class SalaryCivilOtherReduceService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_other_reduce';

    /**
     * 业务名称
     */
    public wfName = '其他减员业务（公务员）';

    constructor(private http: HttpClient, private message: NzMessageService) { }
    /**
     * A0190,A0191特殊保存方法
     */
    saveA0190AndA0191(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/other/reduce/job/specialSave',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
}
