import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivliInnerTransferService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 业务编码
     */
    public wfId = 'salary_civil_inner_transfer';
    /**
     * 业务名称
     */
    public wfName = '新进人员工资业务';

    /**
     * 获得子集字段
     */
    getSetTableFields(TABLE_CODE) {
        const url = `assets/Interface_scheme/salary-civil-inner-transfer/${TABLE_CODE}.json`;
        return this.http.get<[]>(url);
    }

    /**
     * 保存A01
     */
    saveChangeData(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/inner/transfer/job/specialSave',
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
                // filter(json => json.code === 0),
                map(json => json)
            );
    }

    /**
     *多条保存表册数据
     */
    batchSpecialSave(data: any): Observable<boolean> {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/inner/transfer/job/batchSpecialSave',
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
                // filter(json => json.code === 0),
                map(json => json.code === 0)
            );
    }

    /**
     * 保存批量审核
     */
    batchSaveGz06Data(data) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/inner/transfer/job/batchSaveGz06',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('批量保存成功!');
                    } else {
                        this.message.warning(json.msg || '批量保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 计算工龄
     */
    computeYear(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/inner/transfer/job/computeYear`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('计算成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
