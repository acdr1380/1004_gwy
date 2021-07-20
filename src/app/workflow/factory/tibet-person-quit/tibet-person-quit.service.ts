import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TibetPersonQuitService {

    /**
     * 业务编码
     */
    public wfId = 'tibet_person_quit';

    /**
     * 业务名称
     */
    public wfName = '公务员退出业务';

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) { }

    // 表格取数
    getWfListData(data) {
        const url = 'api/gl-1004-workflow-tibet/v1/workflow/tibet/person/quit/job/getWfTableList';
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
