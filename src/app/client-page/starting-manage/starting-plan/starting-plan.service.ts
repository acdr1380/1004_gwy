import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class StartingPlanService {
    constructor(private http: HttpClient, private message: NzMessageService) { }

    /**
     * 增加计划
     * @param data 参数
     * @returns
     */
    insertPlanData(data) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('增加成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 增加计划
     * @param data 参数
     * @returns
     */
    updatePlanData(data) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/update';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('更新成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    deletePlanData(data) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/update';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('删除成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 通过年度查询计划
     */
    selectListByYear(data) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/selectListByYear';
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 根据计划ID查询单位列表
     */
    selectListByBP0101(data) {
        const url = 'api/gl-service-data-civil/v1/data/unit/bp01/selectListByBP0101';
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
     * 根据计划ID查询人员表格
     */
    getPsnTableData(data) {
        const url = 'api/gl-service-data-civil/v1/data/unit/bp02/selectListByBP0213';
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
     * 导入表格
     */
    importExcel(data) {
        const url = 'api/gl-service-data-civil/v1/data/unit/bp02/importExcel';
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
     * 加载表格
     */
    loadPlanTable(data) {
        const url = 'api/gl-1004-workflow-tibet/v1/workflow/tibet/plan/apply/job/getTableData';
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
     * 归档
     */
    archives(data) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/update';
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
