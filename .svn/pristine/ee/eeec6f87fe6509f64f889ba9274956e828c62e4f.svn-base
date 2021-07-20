import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, filter, map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';

@Injectable({
    providedIn: 'root',
})
export class CivilLevelRiseService {
    constructor(private http: HttpClient, private message: NzMessageService) { }

    //#region 批次相关

    /**
     * 保存批次
     * @param data 参数
     */
    saveBatch(data) {
        const url =
            'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/saveBatch';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('操作成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新批次
     * @param data 参数
     */
    updateBatch(data) {
        const url =
            'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/update';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('操作成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询所有批次
     */
    selectAllBatch() {
        const url =
            'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/selectAllBatch';
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
     * 查询所有批次年份
     */
    selectAllYear() {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/selectAllYear`;
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
     * 通过批次id查询所有单位
     * @param batchId 批次编码
     */
    selectUnitAllByBatchId(batchId) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/org/selectAllByBatchId/${batchId}`;
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
     * 保存发送单位
     * @param data 参数
     */
    saveBatchOrg(data) {
        const url =
            'api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/org/save';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('操作成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 加载批次发送对象
     * @param batchId 批次编码
     */
    selectSendUnitList(batchId) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/org/selectAllByBatchId/${batchId}`;
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
     * 删除发送单位
     * @param id 编码
     */
    deleteSendUnit(id) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/org/delete/${id}`;
        return this.http.delete<R>(url).pipe(
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
     * 查询批次统计
     * @param batchId 批次编码
     */
    selectAnalyseData(batchId) {
        const url = `api/gl-1002-workflow-salary-civil/v1/workflow/salary/civil/level/rise/batch/selectAnalyseData/${batchId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => {
                    return {
                        ...item,
                        y: item.count,
                        name: item.name,
                    };
                })
            )
        );
    }
    //#endregion

    //#region 业务工作台
    /**
     * 获得业务主表信息
     * @param wfId 业务编码
     */
    getWfMainData(wfId: string) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/main/detail';
        return this.http.get<R>(`${url}/${wfId}`).pipe(
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
     * 加载办理业务列表
     * @param data 参数
     */
    getWfList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/workbench/info/getWfList';
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
     * 流程监控
     *
     * @param {string} jobId 业务编码
     */
    selectListByWfTracking(jobId: string) {
        const url = `api/gl-1002-workflow-core/v1/workflow/job/handle/selectListByWfTracking/${jobId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '获取历史步骤出错！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data;
            })
        );
    }
    //#endregion
}
