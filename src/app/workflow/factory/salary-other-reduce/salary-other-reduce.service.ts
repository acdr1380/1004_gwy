import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryOtherReduceService {
    /**
     * 业务编码
     */
    public wfId = 'salary_other_reduce';

    /**
     * 业务名称
     */
    public wfName = '其他减员工资业务';

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) { }

    /**
     * A0190,A0191特殊保存方法
     */
    saveA0190AndA0191(data: any) {
        return this.http
            .post<R>('api/gl-1002-workflow-salary/v1/workflow/salary/other/reduce/job/specialSave', data)
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
