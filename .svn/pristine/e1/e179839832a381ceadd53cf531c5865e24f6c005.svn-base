import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';

import * as Mock from 'mockjs';
import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    //#region 业务相关

    /**
     * 获得业务统计状态列表
     */
    getWfListInfo() {
        return of([
            {
                text: '待处理',
                key: 'OPER_PENDING',
                icon: 'file-sync',
                desc: '',
                bgColor: 'linear-gradient(45deg,#4099ff,#73b4ff)',
                value: 1,
            },
            {
                text: '已提交',
                key: 'OPER_PROCESSING',
                icon: 'save',
                desc: '',
                bgColor: 'linear-gradient(45deg,#2ed8b6,#59e0c5)',
                value: 2,
            },
            {
                text: '已完成',
                key: 'OPER_DONE',
                icon: 'file-add',
                desc: '',
                bgColor: 'linear-gradient(45deg,#ffb64d,#ffcb80)',
                value: 3,
            },
            {
                text: '已作废',
                key: 'OPER_CANCEL',
                icon: 'delete',
                desc: '',
                bgColor: 'linear-gradient(45deg,#ff5370,#ff869a)',
                value: 4,
            },
        ]);
    }

    /**
     * 获得业务办理统计
     */
    getByExcludingWfListCount() {
        const url =
            'api/gl-1002-workflow-core/v1/workflow/workbench/info/getByExcludingWfListCount';
        return this.http
            .post<R>(url, {
                state: 1, // 状态 0 all 1待办 2正在办理 3已完成 4已作废
                // wfIds: ['open_exam'],
            })
            .pipe(map(json => json.data));
    }

    /**
     * 获取业务附件
     */
    getOperAttachment(jobId, jobStepId) {
        const url = `api/gl-1002-workflow-core/v1/workflow/param/attachment/selectByJobIdAndJobStepId/${jobId}/${jobStepId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.success(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 工作台查询业务
     */
    getQueryByWfList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/workbench/info/getQueryByWfList';
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
     * 获取业务列表
     */
    getWfList(state, { pageIndex, pageSize }) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/workbench/info/getExcludingWfList';
        return this.http
            .post<R>(url, {
                state, // 状态 0 all 1待办 2正在办理 3已完成 4已作废
                pageIndex,
                pageSize,
                // wfIds: ['open_exam'],
            })
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    }
                })
            );
    }

    /**
     * 流程监控
     */
    selectListByWfTracking(jobId: string) {
        const url = `api/gl-1002-workflow-core/v1/workflow/job/handle/selectListByWfTracking/${jobId}`;
        return this.http
            .get<R>(url)
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    } else {
                        this.message.warning(json.msg);
                    }
                    return [];
                })
            )
            .toPromise();
    }

    /**
     * 获得业务步骤
     */
    getOperStepList(wfId) {
        const stepDetail_url = 'api/gl-1002-workflow-core/v1/workflow/step/selectByWfId';
        return this.http.get(`${stepDetail_url}/${wfId}`).toPromise();
    }
    //#endregion
}
