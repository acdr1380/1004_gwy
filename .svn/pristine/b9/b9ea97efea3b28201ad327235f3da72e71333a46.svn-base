import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, filter, tap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
/**
 * 用户机构节点类型
 */
export enum UserNodeType {
    /**
     * 机构树
     */
    org = 0,
    /**
     * 单位账号
     */
    user = 1,
}
@Injectable({
    providedIn: 'root',
})
export class JournalQueryService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 业务统计
    /**
     * 按月查询业务统计内容
     */
    getStatisticByMonth(data) {
        const url =
            'api/gl-1002-workflow-core/v1/workflow/job/query/selectListByWorkflowStatisticsMonthCount';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    const dataObj = {};
                    json.data.map(v => {
                        const m = v.MONTH.toString();
                        const value = {
                            ...v,
                            ID: v.WF_ID || v.PS0104,
                            NAME: v.WF_NAME || v.PS0104_CN,
                        };
                        dataObj[m] = dataObj[m] || [];
                        dataObj[m].push(value);
                    });
                    return dataObj;
                }
            })
        );
    }

    /**
     * 按年查询业务统计内容
     * @param data 查询内容
     */
    getStatisticByYear(data) {
        const url =
            'api/gl-1002-workflow-core/v1/workflow/job/query/selectListByWorkflowStatisticsCount';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(v => {
                    return {
                        ...v,
                        category: v.WF_Name || v.PS0104_CN,
                    };
                })
            )
        );
    }
    /**
     * 获取指定业务列表
     */
    getCurrentOperList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/main/selectByWfIdAndState';
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
     * 获取指定账本列表
     */
    getCurrentLedgerList(data) {
        const url = `api/gl-data-core/v1/data/core/account/query/selectListByType`;
        const params = {
            selectOrgParamList: data.OrgList,
            tableId: data.TABLEID,
            type: data.ID,
            year: data.YEAR,
            month: data.MONTH,
        };
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#region 机构树
    /**
     * 获得机构树
     */
    getOrgUnitTree(groupId: string, parent = '-1') {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                SYS_PARENT: parent,
            })
            .pipe(
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        return {
                            ...item,
                            title: item.ORG_NAME,
                            key: item.DATA_UNIT_ORG_ID,
                            isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                            nodeType: item.ORG_TYPE,
                        };
                    })
                )
            );
    }
    /**
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http
            .post<R>(url, { SYS_PARENT: '-1' })
            .pipe(
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => ({
                        ...item,
                        title: item.ORG_GROUP_NAME,
                        value: item.DATA_UNIT_ORG_GROUP_ID,
                    }))
                )
            );
    }
    /**
     * 搜索单位
     *
     */
    selectByAuthSearchValue(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByQuery';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    value: item.DATA_UNIT_ORG_ID,
                    text: item.ORG_NAME,
                }))
            )
        );
    }
    /**
     * 查询机构所有的父节点
     */
    selectAllParentsByChild(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    value: item.DATA_UNIT_ORG_ID,
                    text: item.ORG_NAME,
                }))
            )
        );
    }
    /**
     * 查询机构内容
     *
     */
    selectByParentId(orgid: string = '-1') {
        const url = 'api/gl-data-core/v1/data/sys/org/selectByAuthAndParentId';
        return this.http.get<R>(`${url}/${orgid}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    title: item.orgName,
                    key: item.orgId,
                    isLeaf: !item.haveChild,
                }))
            )
        );
    }
    //#endregion

    /**
     * 查询人员
     */
    selectPageByOrgId(data) {
        const url = 'api/gl-data-core/v1/data/person/a01/selectPageByOrgId';
        const params = new HttpParams({ fromObject: data });
        return this.http
            .get<R>(url, { params })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
}
