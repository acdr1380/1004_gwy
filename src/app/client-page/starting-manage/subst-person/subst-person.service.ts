import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SubstPersonService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /** 编辑表格信息 */
    editorTableData(data) {
        const url = 'api/gl-service-data-civil/v1/data/unit/bp02/update';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.error('修改成功！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
