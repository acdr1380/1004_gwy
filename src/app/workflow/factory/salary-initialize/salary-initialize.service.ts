import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryInitializeService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 业务编码
     */
    public wfId = 'salary_initialize';
    /**
     * 业务名称
     */
    public wfName = 'salary_initialize业务';

    /**
     * 特殊保存GZ21A
     */
    saveGZ21A(data: any) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/change/record/saveGZ21A', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('表册数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '表册数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    /**
     * 特殊删除GZ21A
     */
    deleteGZ21A(data: any) {
        return this.http
            .request<R>(
                'delete',
                'api/gl-1002-workflow-core/v1/workflow/data/change/record/deleteGZ21A',
                {
                    body: data,
                }
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('删除成功!');
                    } else {
                        this.message.warning(json.msg || '删除失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(() => true)
            );
    }

    /**
     * 获得子集字段
     */
    getSetTableFields(TABLE_CODE) {
        const url = `assets/Interface_scheme/salary-initialize/${TABLE_CODE}.json`;
        return this.http.get<[]>(url);
    }

    /**
     * 保存A01
     */
    saveChangeData(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/specialSave',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                })
                // filter(json => json.code === 0),
                // map(json => json.data)
            )
            .toPromise();
    }

    /**
     *多条保存表册数据
     */
    saveMultipleTableData(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/batchSpecialSave',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                })
                // filter(json => json.code === 0),
                // map(json => json.data)
            )
            .toPromise();
    }

    /**
     * 保存批量审核
     */
    batchSaveGz06Data(data) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/batchSaveGz06',
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
        const url = `api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/computeYear`;
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
    /**
     * 津补贴同步数据
     */
    allowSyncSave(data) {
        const url = `api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/specialSaveGZ21A`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('保存成功!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    fileUpload(data: FormData) {
        const url = 'api/gl-file-service/attachment/upload';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('附件上传成功。');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            // filter(json => json.code === 0),
            map(json => json)
        );
    }

    /**
     * 导入人员
     */
    importExcelAndVerification(param) {
        const url = 'api/gl-1002-workflow-salary/v1/workflow/salary/initialize/job/importExcel';
        return this.http.post<R>(url, param).pipe(
            tap(res => {
                if (res.code !== 0) {
                    this.message.error(res.msg);
                }
            })
        );
    }
}
