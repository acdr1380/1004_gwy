import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Injectable({
    providedIn: 'root',
})
export class SalaryCalculateService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    /**
     * 业务编码
     */
    public wfId = 'salary_civil_test';

    /**
     * 业务名称
     */
    public wfName = '工资测算（公务员）';

    /**
     * 获取方案列表
     */
    getSchemeByPermission(SCHEME_PERMISSION: string) {
        const url = 'api/gl-service-sys-core/v1/core/system/scheme/selectSchemeByPermission';
        return this.http.post<R>(url, { SCHEME_PERMISSION }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('方案列表请求失败');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取选择人员表格
     * @param {*} data
     */
    selectPsnTblData(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByOrgId';
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

    /**
     * 获得用户信息
     * @param ID 人员ID
     */
    getPersonDataByID(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectOne';
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

    /**
     * 获得子集信息
     * @param TABLE_CODE 子集编码
     */
    getSetChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/${
            setId.toLocaleLowerCase() === 'a01' ? 'selectOneBySalary' : 'selectListKeyId'
        }`;
        const data = {};
        data[`${this.tableHelper.getTableCode(TABLE_CODE)}${setId !== 'A01' ? '_A01' : ''}_ID`] =
            id;
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

    /**
     * 获取业务记录
     */
    selectByWfId() {
        const url = `api/gl-1002-workflow-core/v1/workflow/workbench/info/selectByWfId/${this.wfId}`;
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
     * 发起业务
     */
    start(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/start`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('业务发起成功，请继续办理.');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务数据
     */
    selectStepInfo(data) {
        const params = new HttpParams({ fromObject: data });
        const url = `api/gl-1002-workflow-core/v1/workflow/job/handle/selectStepStandardInfo`;
        return this.http.get<R>(url, { params }).pipe(
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
     * 导人
     */
    importPerson(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/importData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('人员导入成功!');
                } else {
                    this.message.warning(json.msg || '人员导入失败!');
                }
            }),
            map(json => json)
        );
    }

    /**
     *保存多条数据
     */
    saveMultipleTableData(data: any) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/change/record/saveMultiple', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(() => true)
            );
    }

    /**
     * 保存表册信息
     */
    saveChangeData(data: any) {
        return this.http
            .post<R>(
                'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/saveOne',
                data
            )
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 获取人员列表
     * @param {string} wfId
     * @param {JobWfDataParam} data
     */
    getPsnList(wfId: string, data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/job/wf/data/getWfData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 工作测算
     */
    salaryExecute(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/job/salary/salaryExecute`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 删除表册数据
     */
    deleteTableData(data: any) {
        return this.http
            .request<R>(
                'delete',
                'api/gl-1002-workflow-core/v1/workflow/data/change/record/delete',
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
     * 存档
     */
    savePsnData(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/savePsnData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('存档成功');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询存档人员列表
     */
    getSavePsnList(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/getSavePsnList`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg || '获取列表失败!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 删除存档人员
     */
    delSavePsn(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/delSavePsn`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('删除成功');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 刷新人员
     */
    refreshData(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/refreshData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg || '刷新失败!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取未存档人员
     */
    getNotSavePsnList(data) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/test/job/getNotSavePsnList`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg || '获取列表失败!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
