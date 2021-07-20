import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { map, filter, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class TibetPlanApplyService {
    /**
     * 业务编码
     */
    public wfId = 'tibet_plan_apply';

    /**
     * 业务名称
     */
    public wfName = '公招计划申请流程';

    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 计划

    /**
     * 根据年份查询计划
     * @param param 参数
     * @returns 返回年份计划
     */
    getPlanList(param: any) {
        const url = 'api/gl-service-data-civil/v1/data/other/plan/selectListByYear';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询业务计划信息
     * @param jobId jobId
     * @returns 返回计划内容
     */
    getPlanInfo(jobId: string) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/data/plan/apply/param/selectByJobId/${jobId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 保存职位信息
     * @param param 参数
     * @returns 
     */
    setPositionList(param: any) {
        const url = 'api/gl-1004-workflow-tibet/v1/workflow/data/plan/apply/param/save';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion
}
